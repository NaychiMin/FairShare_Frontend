Precondition: CD and server has been set up for backend

# ssh to created instace/server
1. ssh root@YOUR_DROPLET_IP
2. Only if you saved your ssh key in another location: ssh -i "{key_directory}" root@YOUR_DROPLET_IP

# Create deployment directory
mkdir -p ~/fairshare-frontend-deployment
cd ~/fairshare-frontend-deployment

# Clone your repo
git clone https://github.com/NaychiMin/FairShare_Frontend.git .

# Update .env file to update the public address of your server

# Fix CORS policy in backend (can refer to backend repo deployment.md for more info)