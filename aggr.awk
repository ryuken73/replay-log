BEGIN{
	time=0; r200=0; r400=0; r500=0; rOther=0;
	printf "%-30s %-5d %-5d %-5d %-5s\n","TIMESTAMP", 200, 400, 500, "rOther";
}
{
	# change timestamp and print aggregated
	if($1 == "127.0.0.1") next;
	if(time != $3 && time < $3)
	{
		time = $3;
		printf "%-30s %-5d %-5d %-5d %-5d\n",time, r200, r400, r500, rOther;
		r200=0;
		r400=0;
		r500=0;
		rOther=0;
	};
	firstCode = substr($8,1,1);
	if(firstCode == 2){ r200++ };
	if(firstCode == 4){ r400++ };
	if(firstCode == 5){ r500++ };
}
