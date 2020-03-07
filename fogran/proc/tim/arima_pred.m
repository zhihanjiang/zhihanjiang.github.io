%% 
clc;clear;close all;
Mdl = arima('AR',{0.5,-0.3},'MA',0.2,...
	'Constant',0,'Variance',0.1);

rng(5); % For reproducibility
y = simulate(Mdl,100);
plot(y);


%% load data
clc; clear; close all;
load('BTH');

Nb = size(BTH,1);
Nt = size(BTH,2);


%% estimate
clc;
Yt = BTH(77,1:2*24*7*2)';
ToEstMdl = arima(2*24,1,2*4);
EstMdl = estimate(ToEstMdl,Yt);


%% compare
Yp = BTH(77,2*24*7*2+1:end)';
Esty = forecast(EstMdl,2*24,'Y0',Yt);
plot([Yt;Yp],'g');
hold on;
plot([Yt;Esty],'r');
plot([Yt],'b');
