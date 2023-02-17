#! /bin/bash
source .env

# Database backup script
# requirement
#      |- docker running location in DOCKER
#      |- AWS cli location in AWS
#      `- run this scrip in crontab
# use which docker and which aws in the console to get the location
# to run the contab - "contab -e" in terminal
#  *   *    *   *   *  command/to/execute/backup_script.sh
# MIN HOUR DOM MON DOW CMD
# to restore:
# cat /home/path/to/dump/file | psql -h localhost -U <user_name> -d <db_name>

now=$(date +"%d-%m-%Y_%H-%M")
DOCKER=/usr/local/bin/docker
AWS=/Library/Frameworks/Python.framework/Versions/3.7/bin/aws
POSTGRES_USER=$POSTGRES_USER
DATABASE_NAME=$DATABASE_NAME

#backup process
logprint() {
    echo "$(date): $*" >> dbbackup.log
}

logprint "Backup started"
$DOCKER exec -t postgres pg_dump -c -U $POSTGRES_USER -d $DATABASE_NAME > dump_$now.sql 2>>dbbackup.log
logprint "Backup end ---" dump_$now.sql
 REGION=$REGION AWS_ACCESS_KEY_ID=$KEY_ID AWS_SECRET_ACCESS_KEY=$ACCESS_KEY AWS s3 cp dump_$now.sql s3://dbbackupphr 2>> dbbackup.log
logprint "Database pushed to cloud"
rm dump_$now.sql
logprint "Removed dump in local"
