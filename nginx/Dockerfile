# Custom nginx edge image that:
#  1. Starts from the stock nginx:1.27-alpine base
#  2. Ensures the entrypoint script is executable (required on Linux containers)
#
# The stock image is used via `image:` in docker-compose to avoid re-pulling.
FROM nginx:1.27-alpine

# Copy our custom entrypoint script and give it execute permission.
# The script reads BUILD_MODE and copies the correct conf template into place
# before nginx starts (runs from /docker-entrypoint.d/ which is sourced by
# the stock nginx entrypoint before exec'ing nginx).
COPY entrypoint.sh /docker-entrypoint.d/40-pick-conf.sh
RUN chmod +x /docker-entrypoint.d/40-pick-conf.sh

# Templates are mounted at runtime via volumes in docker-compose so they can
# be changed without rebuilding the image.
EXPOSE 80
