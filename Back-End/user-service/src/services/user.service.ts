import { AppDataSource } from "../database/data-source";
import { User } from "../database/entities/UserEntity";
import { Like, Not, In, And } from "typeorm";
import { User as UserInterface } from '../interface/type';
import { Friend } from "../database/entities/FriendEntity";
import { GroupMember } from "../database/entities/GroupMemberEntity";
import { Report } from "../database/entities/ReportEntity";
import crypto from "crypto";

export const getProfileByPhone = async (phone: string): Promise<UserInterface | null> => {
  const user = await AppDataSource.getRepository(User).findOne({
    where: { phone },
    select: ['phone', 'name', 'email', 'password_hash', 'avatar', 'status', 'createdAt'],
  });

  return user || null;
};

export const findUsersByPhone = async (phone: string) => {
  return AppDataSource.getRepository(User).find({
    where: {
      phone: Like(`%${phone}%`),
    },
  });
};


export const updateUserProfileService = async (
  phone: string,
  data: Partial<Omit<User, 'password_hash' | 'createdAt' | 'status'>>
): Promise<User | null> => {
  const repo = AppDataSource.getRepository(User);

  await repo.update({ phone }, data);

  const updatedUser = await repo.findOne({
    where: { phone },
    select: ['phone', 'name', 'email', 'avatar', 'status', 'createdAt'],
  });

  return updatedUser ? updatedUser as User : null;
};


export const changeUserPasswordService = async (phone: string, oldPassword: string, newPassword: string) => {
  const user = await AppDataSource.getRepository(User).findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = oldPassword === user.password_hash;

  if (!isPasswordValid) {
    throw new Error('Invalid old password');
  }

  user.password_hash = newPassword;
  await AppDataSource.getRepository(User).save(user);

  return 'Password updated';
};

export const updateUserStatusByPhoneService = async (
  phone: string,
  status: 'ONLINE' | 'OFFLINE' | string
) => {
  const user = await AppDataSource.getRepository(User).findOne({ where: { phone } });

  if (!user) {
    throw new Error('User not found');
  }

  user.status = status;
  await AppDataSource.getRepository(User).save(user);

  return user;
};




interface PaginatedUser extends User {
  isFriend: boolean;
}

interface PaginatedResponse {
  users: PaginatedUser[];
  pagination: {
    page: number;
    limit: number;
    page_size: number;
  };
}

/**
 * Lấy danh sách user với phân trang, có thể tìm kiếm theo phone,
 * loại bỏ những người bị block và chính user đang đăng nhập.
 */
export const getUsersWithOptionalSearchAndPaginationService = async (
  phone: string,
  page: number = 0,
  pageSize: number = 5,
  searchPhone?: string,
  sortBy?: string
) => {
  // Lấy danh sách block (2 chiều)
  const blockedSet = await getUserFriendsServiceBlock(phone);
  const blockedArray = [...blockedSet];
  const excludedPhones = [phone, ...blockedArray];

  // Kết hợp điều kiện tìm kiếm và loại bỏ danh sách blocked
  const phoneCondition = searchPhone
    ? And(Like(`%${searchPhone}%`), Not(In(excludedPhones)))
    : Not(In(excludedPhones));

  const userWhereCondition = { phone: phoneCondition };

  // Sắp xếp
  const orderBy =
    sortBy === "createdAt" ? { createdAt: "DESC" as const } : undefined;

  // Lấy danh sách user
  const users = await AppDataSource.getRepository(User).find({
    where: userWhereCondition,
    skip: page * pageSize,
    take: pageSize,
    order: orderBy,
    select: ["phone", "name", "email", "avatar", "status", "createdAt"],
  });

  // Lấy danh sách bạn bè
  const friends = await getUserFriendsService(phone);
  const friendPhoneSet = new Set(
    friends.map((f) => (f.user_phone === phone ? f.friend_phone : f.user_phone))
  );

  // Đánh dấu user nào đã là bạn bè
  const usersWithFriendStatus = users.map((user) => ({
    ...user,
    isFriend: friendPhoneSet.has(user.phone),
  }));

  // Tổng số user (để tính tổng trang)
  const totalUsers = await AppDataSource.getRepository(User).count({
    where: userWhereCondition,
  });

  return {
    users: usersWithFriendStatus,
    pagination: {
      page,
      limit: pageSize,
      page_size: totalUsers,
    },
  };
};

/**
 * Lấy danh sách số điện thoại bị block bởi user (2 chiều)
 */
export const getUserFriendsServiceBlock = async (phone: string) => {
  const blockedRelations = await AppDataSource.getRepository(Friend)
    .createQueryBuilder("f")
    .where("(f.user_phone = :phone OR f.friend_phone = :phone)", { phone })
    .andWhere("f.status = :status", { status: "blocked" })
    .getMany();

  const blockedPhones = new Set<string>();
  for (const rel of blockedRelations) {
    blockedPhones.add(
      rel.user_phone === phone ? rel.friend_phone : rel.user_phone
    );
  }
  return blockedPhones;
};

/**
 * Lấy danh sách bạn bè đã được chấp nhận (accepted)
 * Có thể lọc theo tên bạn bè
 */
export const getUserFriendsService = async (phone: string, name?: string) => {
  const nameFilter = name ? `%${name}%` : null;

  const friends = await AppDataSource.getRepository(Friend)
    .createQueryBuilder("f")
    .innerJoinAndSelect("f.friend", "friend")
    .where("(f.user_phone = :phone OR f.friend_phone = :phone)", { phone })
    .andWhere("f.status = :status", { status: "accepted" })
    .andWhere(nameFilter ? "friend.name LIKE :name" : "1=1", {
      name: nameFilter,
    })
    .getMany();

  return friends;
};




export const getUserFriendsServiceControll = async (phone: string, name?: string, type?: string) => {
  const nameFilter = name ? `%${name}%` : null;

  const query = await AppDataSource.getRepository(Friend)
    .createQueryBuilder('f')
    .innerJoinAndSelect('f.friend', 'friend')
    .innerJoinAndSelect('f.user', 'user')
    .where('(f.user_phone = :phone OR f.friend_phone = :phone)', { phone });
  // Lọc theo type
  if (type == "4") {
    query.andWhere('f.status = :status', { status: 'no' });
  } else {
    query.andWhere('f.status = :status', { status: 'accepted' });
  }

  const friends = await query.getMany();

  // Xử lý để trả về đúng user còn lại + last_message + last_message_date
  const result = friends
    .map((friend) => {
      const isUser = friend.user_phone === phone;
      const otherUser = isUser ? friend.friend : friend.user;

      // Apply name filter (nếu có)
      if (nameFilter && !otherUser.name.toLowerCase().includes(name?.toLowerCase() || '')) {
        return null;
      }


      return {
        user: otherUser,
        last_message: friend.last_message,
        last_message_date: friend.last_message_date,
        unread_count_user: friend.unread_count_user,
        unread_count_friend: friend.unread_count_friend,
        user_phone: friend.user_phone,
        friend_phone: friend.friend_phone
      };
    })
    .filter((item) => item !== null);

  return result;
};




// getPendingFriendRequestsService: Lấy danh sách lời mời kết bạn chờ
export const getPendingFriendRequestsService = async (userPhone: string) => {
  return AppDataSource.getRepository(Friend).find({
    where: {
      friend_phone: userPhone,
      status: 'pending',
    },
    relations: ['user'],
  });
};


export const getFriendDetailsService = async (userPhone: string, friendPhone: string) => {
  // Query to find the accepted friend relationship between the two users
  const friend = await AppDataSource.getRepository(Friend)
    .createQueryBuilder('f')
    .leftJoinAndSelect('f.user', 'user')
    .leftJoinAndSelect('f.friend', 'friend')
    .where(
      '(f.user_phone = :userPhone AND f.friend_phone = :friendPhone) OR (f.user_phone = :friendPhone AND f.friend_phone = :userPhone)',
      { userPhone, friendPhone }
    )
    .andWhere('f.status = :status', { status: 'accepted' })
    .getOne();

  // If no accepted friendship is found, throw an error
  if (!friend) {
    throw new Error('No accepted friendship found');
  }

  // Return the friend details based on the userPhone
  let friendPhone_ = friend.user_phone === userPhone ? friend.friend_phone : friend.user_phone;
  let friendDetails = await AppDataSource.getRepository(User).findOne({ where: { phone: friendPhone_ } });

  return friendDetails;
};


export const getUsersByPhonesService = async (phones: string[], nameFilter: string | null): Promise<User[]> => {
  try {
    // Start the query to fetch users
    const query = AppDataSource.getRepository(User)
      .createQueryBuilder('user')
      .where('user.phone IN (:...phones)', { phones });

    // Apply name filtering if nameFilter is provided
    if (nameFilter) {
      query.andWhere('user.name LIKE :name', { name: `%${nameFilter}%` });
    }

    // Execute the query and return the results
    const users = await query.getMany();
    return users;

  } catch (error) {
    console.error('Error fetching users by phones:', error);
    throw new Error('Error fetching users by phones');
  }
};


export const getUserGroupIdsService = async (phone: string): Promise<number[]> => {
  const groupMembers = await AppDataSource.getRepository(GroupMember)
    .createQueryBuilder('gm')
    .select('gm.group_id', 'group_id')
    .where('gm.user_phone = :phone', { phone })
    .andWhere('gm.status = true')
    .getRawMany();

  // Trả về mảng group_id
  return groupMembers.map(gm => gm.group_id);
};



export const getBlockedFriends = async (phone: string) => {
  const blockedFriends = await AppDataSource.getRepository(Friend)
    .createQueryBuilder('f')
    // Join bảng User để lấy thông tin người kia
    .innerJoinAndSelect(
      User,
      'u',
      `u.phone = CASE 
        WHEN f.user_phone = :phone THEN f.friend_phone
        ELSE f.user_phone
      END`,
      { phone }
    )
    .where('(f.user_phone = :phone OR f.friend_phone = :phone)', { phone })
    .andWhere('f.status = :status', { status: 'blocked' })
    .select([
      'f.user_phone',
      'f.friend_phone',
      'f.status',
      'u.phone',
      'u.name',
      'u.email',
      'u.avatar',
      'u.status',
      'u.createdAt',
    ])
    .getRawMany();

  return blockedFriends;
};


export const searchUsersByName = async (
  name: string,
  page: number = 1,
  limit: number = 10
) => {
  const qb = AppDataSource.getRepository(User).createQueryBuilder("u");

  if (name && name.trim() !== "") {
    qb.where("u.phone LIKE :phone", {
      phone: `%${name}%`,
    });

  }

  qb.orderBy("u.createdAt", "DESC")
    .skip((page - 1) * limit)
    .take(limit);

  const [users, total] = await qb.getManyAndCount();


  return { users, total }
};


import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: "lekhanhuyenn.12@gmail.com",  // Gmail của bạn
    pass: "frbgrgcfqhhzxgva",           // App password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const generatePassword = (length: number = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, chars.length);
    password += chars[randomIndex];
  }
  return password;
};




export const sendResetPasswordEmail = async (to: string) => {
  // sinh mật khẩu ngẫu nhiên (8 ký tự)
  const newPassword = generatePassword(8)
  const mailOptions = {
    from: '"My App" <lekhanhuyenn.12@gmail.com>',
    to,
    subject: "Reset mật khẩu",
    text: `Xin chào,\n\nMật khẩu mới của bạn là: ${newPassword}\n\nHãy đăng nhập và đổi lại mật khẩu trong phần cài đặt.`,
  };

  // gửi email
  await transporter.sendMail(mailOptions);
  const email = to
  const userRepo = AppDataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  user.password_hash = newPassword;
  await userRepo.save(user);


  // return về để lưu DB hoặc update user
  return newPassword;
};


export const toggleUserStatusService = async (phone: string) => {
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { phone } });

  if (!user) {
    throw new Error("User not found");
  }

  user.status = user.status === "BLOCK" ? "NOTBLOCK" : "BLOCK";
  await userRepo.save(user);

  return user;
};



// 1. Thêm báo cáo
export const addReportService = async (
  reported_phone: string,
  reporter_phone: string,
  reason: string
) => {
  const reportRepo = AppDataSource.getRepository(Report);

  const report = reportRepo.create({
    reported_phone,
    reporter_phone,
    reason,
  });

  return await reportRepo.save(report);
};


// 2. Lấy danh sách báo cáo theo ngày
export const getReportsByDateService = async (date: string) => {
  const reportRepo = AppDataSource.getRepository(Report);

  return await reportRepo
    .createQueryBuilder("report")
    .where("DATE(report.createdAt) = :date", { date })
    .orderBy("report.createdAt", "DESC")
    .getMany();
};


// 3. Update trạng thái báo cáo
export const updateReportStatusService = async (id: string, status: string) => {
  const reportRepo = AppDataSource.getRepository(Report);

  const report = await reportRepo.findOne({ where: { id } });

  if (!report) {
    throw new Error("Report not found");
  }

  report.status = status;
  await reportRepo.save(report);

  return report;
};