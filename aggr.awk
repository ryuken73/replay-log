BEGIN{
	col_time = ENVIRON["COL_TIME"] ? ENVIRON["COL_TIME"] : 3;
	col_ip = ENVIRON["COL_IP"] ? ENVIRON["COL_IP"] : 1;
	col_status = ENVIRON["COL_STATUS"] ? ENVIRON["COL_STATUS"] : 8;
	server_addr = ENVIRON["VIZ_SERVER"] ? ENVIRON["VIZ_SERVER"] : "http://localhost:9009/liveReqStat";
	aggr_interval = ENVIRON["AGGR_INTERVAL_SEC"] ? ENVIRON["AGGR_INTERVAL_SEC"] : 1 ;

	lastTime = systime(); r200 = 0; r300 = 0; r400 = 0; r500 = 0; rOther = 0;
	printf "%-30s %-5d %-5d %-5d %-5d %-5s\n","TIMESTAMP", 200, 300, 400, 500, "rOther";
}
{
	# change timestamp and print aggregated
	accTime = $col_time; srcIP = $col_ip; status = $col_status;
	# if source ip is localhost, ignore.
	if(srcIP == "127.0.0.1") next;
	currTime = systime();
	if(currTime - lastTime > aggr_interval){
		printf "%-30s %-5d %-5d %-5d %-5d %-5d\n",accTime, r200, r300, r400, r500, rOther;
		result = "{\"timestamp\":" currTime ",\"200\":" r200 ",\"300\":" r300",\"400\":" r400",\"500\":" r500",\"other\":" rOther"}"
		system("curl -s -m 0.7 --retry 0 -d '" result "' -H 'Content-Type:application/json' -X POST " server_addr);
		# reset timer
		lastTime = currTime;
		# reset metrics.
		r200 = 0; r300 = 0; r400 = 0; r500 = 0; rOther = 0;
	}

	firstCode = substr(status,1,1);
	if(firstCode == 2){ r200++; next; };
	if(firstCode == 3){ r300++; next; };
	if(firstCode == 4){ r400++; next; };
	if(firstCode == 5){ r500++; next; };
	rOther++;
}
