export LOG_DIR=/bigfs
export SRC_FILE_NAME=access.log-2021070814
export DST_FILE_NAME=clone_access.log

if [ -e 'setup_env.sh' ]
then
    . ./setup_env.sh
fi

node ./log_replay.js --input-type=module
