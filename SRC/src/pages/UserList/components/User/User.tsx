import React, { useEffect, useState } from 'react'
import Popover from 'src/components/Popover'
import { UserT as ProductType } from 'src/types/product.type'
import dayjs from 'dayjs'
import { User } from 'src/types/user.type'
import { toast } from 'react-toastify'
import friendApi from 'src/apis/friend.api'
import { useSocketContext } from 'src/contexts/SocketContext';
import { useNavigate } from 'react-router-dom'
import { IMessageExtended } from 'src/types/utils.type';
import reportApi from 'src/apis/report.api'
import { ObjectId } from "bson";

interface Props {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>
  product: ProductType
  profileDataLS: User
}

export default function UserComponent({ selectedCategory, setSelectedCategory, product, profileDataLS }: Props) {
  const [isSending, setIsSending] = useState(false)
  const [isUnfriend, setIsUnfriend] = useState(false)
  const navigate = useNavigate()
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const { socketReady, onlineUsers, socket } = useSocketContext();

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      toast.error('Vui lòng nhập lý do báo cáo!')
      return
    }
    try {
      const res = await reportApi.createReport({
        reporter_phone: profileDataLS.phone as string,
        reported_phone: product.phone as string,
        reason: reportReason
      })
      toast.success('Báo cáo đã được gửi!')
      setIsReportModalOpen(false)
      setReportReason('')
    } catch (error) {
      console.error(error)
      toast.error((error as any)?.response?.data?.message || 'Lỗi khi gửi báo cáo')
    }
  }



  const handleUnfriend = async () => {

    console.log({
      senderPhone: profileDataLS.phone as string,
      receiverPhone: product.phone as string
    })
    try {
      setIsUnfriend(true)
      var res = await friendApi.unfriend({
        senderPhone: profileDataLS.phone as string,
        receiverPhone: product.phone as string
      })

      toast.success(res.data)
    } catch (error) {
      console.error(error)
      toast.error((error as any)?.response?.data?.message || 'Lỗi hủy kết bạn')
    } finally {
      setIsUnfriend(false)
    }
  }
  const handleSendFriendRequest = async () => {
    try {
      setIsSending(true)
      var res = await friendApi.sendFriendRequest({
        senderPhone: profileDataLS.phone as string,
        receiverPhone: product.phone as string
      })
      if (res.data === 'You can not send a friend request to yourself') {
        toast.warning(res.data)
      } else {
        toast.success(res.data)
      }
      // Có thể cập nhật lại UI ở đây, ví dụ:
      // refetchFriendList()
    } catch (error) {
      console.error(error)
      toast.error((error as any)?.response?.data?.message || 'Lỗi gửi lời mời kết bạn')
    } finally {
      setIsSending(false)
    }
  }


  const handleClickNotification = async (purchase: string, isfiend: boolean) => {
    console.log(purchase)
    navigate('/profile/' + purchase + '/' + isfiend)
  }

  const isOnline = onlineUsers.includes(product.phone as string)
  console.log(isOnline)

  const handleSendMessage = (phone: string) => {
    if (!messageText.trim()) {
      toast.error('Vui lòng nhập nội dung tin nhắn!')
      return
    }

    console.log('Tin nhắn:', messageText)
    toast.success('Tin nhắn đã gửi!')
    setMessageText('')
    setIsMessageModalOpen(false)

    let newMsg: IMessageExtended;
    let tempId = new ObjectId().toHexString(); // ví dụ "64f4e2a0c2b7a1b3d4e5f6a7"

    newMsg = {
      _id: tempId,
      text: messageText,
      sender: profileDataLS.phone || '',
      receiver: phone || '',
      is_group: false,
      content_type: 'text',
      avt: profileDataLS?.avatar,
      name: profileDataLS?.name,
      typeSend: "1"
    };

    if (socket) {
      console.log("Connect");
      socket.emit("sendMessage", newMsg);
    } else {
      console.warn("Socket is not connected.");
    }
  }


  return (
    <div
      className={`group relative w-full max-w-xs rounded-xl border border-gray-200 shadow-sm transition duration-300 hover:shadow-md ${product.isFriend ? 'bg-green-100' : 'bg-white'
        }`}
    >


      {/* Avatar */}
      <div className='relative'>
        <img
          src={product.avatar}
          alt={product.name}
          className='mx-auto mt-4 h-20 w-20 rounded-full object-cover shadow-md group-hover:scale-105 transition-transform duration-300'
        />
        {/* Icon online/offline */}
        <span
          className={`absolute bottom-1 right-4 h-3 w-3 rounded-full border border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}
          title={isOnline ? 'Online' : 'Offline'}
        ></span>
        {/* Popover Button */}
        <div className='absolute top-2 right-2'>
          <Popover
            as='div'
            className='relative'
            renderPopover={
              <div className='w-36 rounded-md border bg-white py-2 shadow-lg text-sm'>

                {product.isFriend ? (
                  <button className='block w-full px-4 py-1 hover:bg-gray-100'
                    onClick={handleUnfriend}
                    disabled={isUnfriend}
                  >😊 Hủy kết bạn</button>
                ) : <button
                  onClick={handleSendFriendRequest}
                  disabled={isSending}
                  className='block w-full px-4 py-1 hover:bg-gray-100 disabled:opacity-50'
                >
                  🔍 {isSending ? 'Đang gửi...' : 'Kết bạn'}
                </button>}
                <button onClick={() => handleClickNotification(product.phone || '0', product.isFriend || false)} className='block w-full px-4 py-1 hover:bg-gray-100'>👤 Trang cá nhân</button>

                {!product.isFriend && (
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="block w-full px-4 py-1 hover:bg-gray-100"
                  >
                    💬 Nhắn tin
                  </button>
                )}

                <button
                  onClick={() => setIsReportModalOpen(true)}
                  className="block w-full px-4 py-1 hover:bg-gray-100 text-red-600"
                >
                  🚨 Báo cáo
                </button>

              </div>
            }
          >
            <div className='cursor-pointer rounded-full bg-white p-1 shadow hover:bg-gray-100'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                strokeWidth={1.5}
                stroke='currentColor'
                className='h-5 w-5 text-gray-600'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582'
                />
              </svg>
            </div>
          </Popover>
        </div>
      </div>

      {/* Info */}
      <div className='px-4 py-3 text-center space-y-1'>
        <h3 className='text-sm font-semibold text-gray-800 truncate'>{product.name}</h3>
        <p className='text-xs text-gray-500'>
          <span className='font-medium text-gray-700'>🗓️ {dayjs(product.createdAt).format('DD/MM/YYYY HH:mm')}</span>
        </p>
        <p className='text-xs text-gray-500'>
          📞 <span className='font-medium text-gray-700'>{product.phone}</span>
        </p>
      </div>


      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Nhắn tin với {product.name}</h2>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full border rounded-md p-2 mb-4 resize-none h-28"
              placeholder="Nhập tin nhắn..."
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                onClick={() => setIsMessageModalOpen(false)}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => handleSendMessage(product.phone || '')}

              >
                Gửi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Report Modal --- */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Báo cáo {product.name}</h2>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full border rounded-md p-2 mb-4 resize-none h-28"
              placeholder="Nhập lý do báo cáo..."
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                onClick={() => setIsReportModalOpen(false)}
              >
                Đóng
              </button>
              <button
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                onClick={handleReportUser}
              >
                Gửi báo cáo
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
