import { User } from 'src/types/user.type'
import { SuccessResponse, changePassword } from 'src/types/utils.type'
import { UserTListConfig, UserT as ProductType, UserTList } from 'src/types/product.type'

import http from 'src/utils/http'

interface BodyUpdateProfile extends Omit<User, '_id' | 'roles' | 'createdAt' | 'updatedAt' | 'email'> {
  password?: string
  newPassword?: string
}

interface UserAdminResponse {
  users: ProductType[]
  total: number
}

const userApi = {
  getProfile(phone: string) {
    return http.get<SuccessResponse<User>>(`/api/user/user/profile/${phone}`)
  },
  updateProfile(phone: string, body: BodyUpdateProfile) {
    return http.put<SuccessResponse<User>>(`/api/user/user/profile/${phone}`, body)
  },
  changepassword(body: changePassword, phone: string) {
    return http.patch<String>(`/api/user/user/profile/${phone}/password`, body);
  }
  ,
  getListUser(queryConfig: UserTListConfig, phone: string) {
    return http.get<SuccessResponse<UserTList>>(`/api/user/user/paginate/${phone}`, {params: queryConfig})
  },
    getListUserAdmin(queryConfig: UserTListConfig) {
    return http.get<UserAdminResponse>(`/api/user/user/user-admin`, {params: queryConfig})
  }
  ,
    resetPassUserAdmin(body :{ email:string}) {
    return http.post<string>(`/api/user/user/user-admin-reset`, body)
  }

    ,
    resetsatusUserAdmin(phone: string) {
    return http.patch<string>(`/api/user/user/user-admin-reset-status/${phone}`)
  }
}

export default userApi
