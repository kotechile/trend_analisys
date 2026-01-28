FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom config
COPY trend-analysis.conf /etc/nginx/conf.d/default.conf
