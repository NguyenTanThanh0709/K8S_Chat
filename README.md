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