
FROM php:8.1-apache

# Set the working directory in the container
WORKDIR /var/www/html

# Copy all project files to the container
COPY . /var/www/html/

# Give proper permissions for uploads
RUN mkdir -p /var/www/html/uploads && chmod -R 777 /var/www/html/uploads

# Expose port 80 for the web server
EXPOSE 80

# Start Apache when the container starts
CMD ["apache2-foreground"]
