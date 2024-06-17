# Nouvelles API

Nouvelles API : information website and forum.

## Usage

Rename the file **config.env.env** to **config.env** and update the values.

### config.env example

```
# Port to use
PORT=5000


# Maximum number of requests per minute (used only in prod mode)
RATE_LIMIT=100


# Database user
DB_USER=postgres

# Database host
DB_HOST=localhost

# Database name
DB_DATABASE=nouvelles

# Database password
DB_PASSWORD=I9jz4p8m

# Database port
DB_PORT=5432


# AWS SES Region
AWS_SES_REGION=sesregion

# AWS API Access Key
AWS_ACCESS_KEY_ID=accesskeyid

# AWS API Secret Access Key
AWS_SECRET_ACCESS_KEY=secretaccesskey

# AWS S3 Upload Bucket Region
AWS_S3_REGION=s3region

# AWS S3 Upload Image Bucket Name
AWS_S3_IMAGE_BUCKET_NAME=s3bucketname

# AWS S3 Upload Image Bucket Directory
AWS_S3_IMAGE_BUCKET_FOLDER=directory


# From email name
FROM_NAME=Nouvelles

# From email adress
FROM_EMAIL=noreply@test.com

# Reply email adress
REPLY_EMAIL=contact@test.com


# JWT Token secret code
JWT_SECRET=secret

# JWT Token duration. On this example it will expire in 180 days
JWT_EXPIRE=180d

# JWT Token cookie duration. The value is in days.
JWT_COOKIE_EXPIRE=180

# The minimum password length
PASSWORD_MIN_LENGTH=12


# Clear token cron execution date
CLEAR_TOKENS_CRON_DATE=* * * * *


# The front end URL
APP_URL=r3tests.net/nouvelles
```

## Install dependencies

```
npm install
```

## Run API

```
# Run in development mode
npm run dev

# Run in production mode
npm run prod
```

## Database configuration

Configure the database by creating tables and adding some data.

Warning: this command will delete all previous data. Do a backup to avoid lost of data.

```
npm run dbsetup
```

## Generate documentation

```
npm run gendoc
```

---

- Version: 0.6.0
- License: MIT
- Author: Raphaël Ragoomundun
