BEGIN{
	col_time = ENVIRON["COL_TIME"];
	col_ip = ENVIRON["COL_IP"];
	col_status = ENVIRON["COL_STATUS"];
	server_addr = ENVIRON["VIZ_SERVER"];

	time=0; r200=0; r300=0; r400=0; r500=0; rOther=0;
	printf "%-30s %-5d %-5d %-5d %-5d %-5s\n","TIMESTAMP", 200, 300, 400, 500, "rOther";
}
{
	# change timestamp and print aggregated
	newTime = $col_time; srcIP = $col_ip; status = $col_status;
	# if source ip is localhost, ignore.
	if(srcIP == "127.0.0.1") next;
	if(time < newTime)
	{
		if(time != 0){
			# time changed. print aggreated and set time as newTime.
			printf "%-30s %-5d %-5d %-5d %-5d %-5d\n",time, r200, r300, r400, r500, rOther;
			result = "{\"timestamp\":" systime() ",\"200\":" r200 ",\"300\":" r300",\"400\":" r400",\"500\":" r500",\"other\":" rOther"}"
			system("/usr/bin/curl -s -m 0.7 --retry 0 -d '" result "' -H 'Content-Type:application/json' -X POST " server_addr);
		}
		# reset time
		time = newTime;
		# reset metrics.
		r200=0; r300=0; r400=0; r500=0; rOther=0;
	};
	if(time > newTime){
		# new record is older then before.
		print "new record is older then before. ignore line";
		time=0;
		next;
	}
	firstCode = substr(status,1,1);
	if(firstCode == 2){ r200++; next; };
	if(firstCode == 3){ r300++; next; };
	if(firstCode == 4){ r400++; next; };
	if(firstCode == 5){ r500++; next; };
	rOther++;
}
