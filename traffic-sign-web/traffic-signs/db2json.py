import numpy as np
import matplotlib.pyplot as plt
import sqlite3
import json
import urllib.request

conn = sqlite3.connect("../../data/traffic_sign_pano.db")
c = conn.cursor()

types = ['no_parking', 'turn_left', 'turn_right', 'uturn'];
for i in range(len(types)):
	tp = types[i];
	c.execute('SELECT id,type,sign_lat,sign_lon FROM traffic_signs where type=\''+tp+'\'')
	signs=c.fetchall()
	temp=[]
	for sign in signs:
		temp.append({"id":sign[0],"type":sign[1],"sign_lon":sign[3],"sign_lat":sign[2]})
	with open('sign_'+tp+'.json', 'w') as f:
		json.dump([temp], f)