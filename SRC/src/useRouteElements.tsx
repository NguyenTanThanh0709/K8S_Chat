import { lazy, useContext } from 'react'
import { Navigate, Outlet, useRoutes } from 'react-router-dom'
import path from 'src/constants/path'
import { AppContext } from './contexts/app.context'
import MainLayout from './layouts/MainLayout'
import RegisterLayout from './layouts/RegisterLayout'
import UserLayout from './pages/User/layouts/UserLayout'

const Login = lazy(() => import('./pages/Login'))
const UserList = lazy(() => import('./pages/UserList'))
const Profile = lazy(() => import('./pages/User/pages/Profile'))
const Register = lazy(() => import('./pages/Register'))
const ChangePassword = lazy(() => import('./pages/User/pages/ChangePassword'))
const Block = lazy(() => import('./pages/User/pages/Block'))
const NotFound = lazy(() => import('./pages/NotFound'))
const UserP = lazy(() => import('./pages/UserP'))
const VideoCall = lazy(() => import('./pages/VideoCall'))
const AdminPage = lazy(() => import('./pages/AdminPage'))

function ProtectedRoute() {
  const { isAuthenticated } = useContext(AppContext)
  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />
}

function RejectedRoute() {
  const { isAuthenticated } = useContext(AppContext)

  return !isAuthenticated ? <Outlet /> : <Navigate to='/' />
}

export default function useRouteElements() {
  const routeElements = useRoutes([
    // 🟥 Các route KHÔNG cần login (chỉ khi chưa login)
    {
      path: '',
      element: <RejectedRoute />, // ⛔ Nếu đã login => redirect
      children: [
        {
          path: path.login,
          element: (
            <RegisterLayout>
              <Login />
            </RegisterLayout>
          )
        },
        {
          path: path.register,
          element: (
            <RegisterLayout>
              <Register />
            </RegisterLayout>
          )
        }
      ]
    },

    // ✅ Tất cả các route còn lại ĐỀU phải đăng nhập
    {
      path: '',
      element: <ProtectedRoute />, // ✅ Nếu chưa login => redirect
      children: [
        {
          path: path.user,
          element: (
            <MainLayout>
              <UserLayout />
            </MainLayout>
          ),
          children: [
            {
              path: path.profile,
              element: <Profile />
            },
            {
              path: path.changePassword,
              element: <ChangePassword />
            },
            {
              path: path.block,
              element: <Block />
            }
          ]
        },
        {
          path: 'profile/:phone/:isFriend',
          element: (
            <MainLayout>
              <UserP />
            </MainLayout>
          )
        },
        {
          path: '',
          element: (
            <MainLayout>
              <UserList />
            </MainLayout>
          ),
          index: true
        },
        {
          path: '*',
          element: (
            <MainLayout>
              <NotFound />
            </MainLayout>
          )
        },
        {
          path: '/call',
          element: (
              <VideoCall />
          )
        }
        ,
        {
          path: '/admin-dashboard',
          element: (
              <AdminPage />
          )
        }
      ]
    }
  ])

  return routeElements
}
