FROM ubuntu:latest

# Install dependencies
RUN apt update && apt install -y \
    curl wget unzip git build-essential clang cmake pkg-config libssl-dev llvm-dev libclang-dev ca-certificates \
    && rm -rf /var/lib/apt/lists/*
	
# Configure git
RUN git config --global http.sslVerify false

# Install Rust
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Sui Client from Mainnet branch
RUN cargo install --locked --git https://github.com/MystenLabs/sui.git --branch mainnet sui --features tracing

# Install Walrus Client
RUN wget https://storage.googleapis.com/mysten-walrus-binaries/walrus-mainnet-latest-ubuntu-x86_64-generic -O /usr/local/bin/walrus && \
    chmod +x /usr/local/bin/walrus

# Create necessary directories
RUN mkdir -p /root/walrus /root/.config/walrus /root/.sui/sui_config

# Expose required ports
EXPOSE 9696

# Copy and set permissions for the entrypoint script
COPY walrus/* /root/.config/walrus/
COPY sui/* /root/.sui/sui_config/
