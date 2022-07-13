export LOG_DIR=/d/temp
export ACCESS_LOG=clone_access.log

export COL_TIME=3
export COL_IP=1
export COL_STATUS=8
export VIZ_SERVER="http://localhost:9009/edgeLive"
export AGGR_INTERVAL_SEC=5


/usr/bin/tail -F $LOG_DIR/$ACCESS_LOG|awk -f ./aggr.awk

