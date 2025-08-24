# 🎟️ Hệ thống Đặt Vé Sự Kiện - Triển khai trên Kubernetes

## 📌 Giới thiệu

Dự án này là hệ thống đặt vé sự kiện (event ticketing) có khả năng **mở rộng, chịu tải cao** nhờ kiến trúc **microservices** triển khai trên **Kubernetes**.  
Hệ thống bao gồm các service chính:

- **user-service**: Quản lý người dùng, đăng nhập, đăng ký, thông tin cá nhân.  
- **event-service**: Quản lý sự kiện, lịch biểu, chi tiết chương trình.  
- **booking-service**: Đặt vé, thanh toán, xác nhận vé.  
- **chat-service**: Hỗ trợ trò chuyện, thông báo theo thời gian thực.  
- **socket-service**: Xử lý realtime (WebSocket), gửi/nhận thông báo.  

Tất cả được đóng gói dưới dạng **Docker image** và triển khai trên **Minikube Kubernetes cluster**.  
Ứng dụng hỗ trợ scaling bằng **Horizontal Pod Autoscaler (HPA)** để dễ dàng mở rộng khi có nhiều người dùng truy cập.

---

## 🚀 Hướng dẫn chạy Source

### 1️⃣ Yêu cầu môi trường
- [Docker](https://www.docker.com/)  
- [Minikube](https://minikube.sigs.k8s.io/docs/)  
- [kubectl](https://kubernetes.io/docs/tasks/tools/)  
- Tài khoản [DockerHub](https://hub.docker.com/) (nếu muốn build & push image)

---

# Hưỡng dẫn chạy Source
Docker
Minikube
kubectl 
(Có DockerHub account để push image)
1. git clone https://github.com/NguyenTanThanh0709/K8S_Chat.git
2. cd K8S_Chat
2. docker-compose up
3. minikube start
4. minikube tunnel
5. cd k8s
6. kubectl apply -f .
7. kiểm tra trạng thái
kubectl get pods -n microservices
kubectl get svc -n microservices
kubectl get ingress -n microservices
8. ứng dụng chạy trên http://localhost