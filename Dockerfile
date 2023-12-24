# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the static content (index.html and raffle.js) to the Nginx web root directory
COPY index.html /usr/share/nginx/html/index.html
COPY raffle.js /usr/share/nginx/html/raffle.js

# Change ownership to the nginx user for required directories
RUN chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx

# Expose port 80 to the outside once the container has launched
EXPOSE 80

