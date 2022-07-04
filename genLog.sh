if [ -e 'setup_env.sh' ]
then
    . ./setup_env.sh
fi

node ./log_replay.js --input-type=module
