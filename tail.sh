if [ -e 'setup_env.sh' ]
then
    . ./setup_env.sh
fi

node ./tail.js
# node --prof ./tail.js
