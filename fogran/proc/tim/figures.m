%%
clc; clear; close all;
% load('SMS_IN'); load('SMS_OUT'); load('SMS');
% load('CALL_IN'); 
% load('CALL_OUT'); 
% load('CALL');
load('INTERNET');
load('SID.mat');

Ng = 10000; Nt = 6*24*62; Nh = Nt/6;


%% select Milano base stations
M = INTERNET(SID,:);
Nm = size(M,1);


%% aggregate by hour, extract 4 good weeks, and generate a typical day view
clc;
H = squeeze(sum(reshape(M,Nm,6,Nh),2));
H = H(:,24*3+1:24*3+24*7*4);
H = squeeze(mean(reshape(H,Nm,24,7*4),3));
H = normr(H);


%% example: two different areas
clc; close all;

% i1 = randi(size(M,1));
i1 = 1417; %1816;1834
m1 = H(i1,:);
[x,y1] = prepareCurveData([],m1);
[s1, ~] = fit(x,y1,'smoothingspline');
s1 = s1(1:24);

i2 = 191;
m2 = H(i2,:);
[x,y2] = prepareCurveData([],m2);
[s2, ~] = fit(x,y2,'smoothingspline');
s2 = s2(1:24);

[s3, ~] = fit(x,y1+y2,'smoothingspline');
s3 = s3(1:24);


%% plot individual data traffic
clc;close all;
figure('Position',[500,500,500,230]);
hold on; grid on;
xlim([1,25]);   ylim([0,.6]);
h1 = plot(s1,'b');      h2 = plot(s2,'r--');  
h3 = scatter(15,.31,100,'b^');      text(15,.35,'0.32','FontSize',18);
h4 = scatter(22,.2975,100,'r^');      text(22,.33,'0.30','FontSize',18);
set(h1,'LineWidth',2);      set(h2,'LineWidth',2);   
set(h3,'LineWidth',1);      set(h4,'LineWidth',1);
ax = gca;
set(ax,'FontSize',18);
ax.XTick = 1:2:25;    ax.XTickLabel = 0:2:24;
xlabel('Hour');     ylabel('Data Traffic');
gridLegend([h1,h2],2,{'\fontsize{18} Business District',...
    '\fontsize{18} Residential Area'},'Location','North','Fontsize',18);


%% plot aggregated data traffic
clc;close all;
figure('Position',[500,500,500,230]);
hold on; grid on;
h1 = plot(s3,'k');      set(h1,'LineWidth',2);
h2 = scatter(17,.50,100,'k^');      text(17,.54,'0.50','FontSize',18);
xlim([1,25]);   ylim([0,.6]);
ax = gca;
set(ax,'FontSize',18);
ax.XTick = 1:2:25;    ax.XTickLabel = 0:2:24;
xlabel('Hour');     ylabel('Data Traffic');
gridLegend(h1,1,{'\fontsize{18} Aggregated Traffic'},'Location','Southeast','Fontsize',18);


%% plot a base station's weekly traffic pattern
load('../data/BTH');
H = BTH(87,1:24*7); % 154, 87
H = H/max(H);

clc;close all;
figure('Position',[500,500,500,200]);
plot(H,'LineWidth',2);
grid on;
ax = gca; axis tight;
ax.XTick = 1:24:24*7;   
ax.XTickLabel = {'MON','TUE','WED','THU','FRI','SAT','SUN'};
ylabel('Data Traffic');
set(ax,'FontSize',18);


%%
clc;close all;
LW = 1.5;
figure('Position',[500,500,500,400]);
hold on; grid on;
plot(COST*100,'r-^','LineWidth',LW,'MarkerFaceColor','r');
plot(UTIL*105,'b-o','LineWidth',LW,'MarkerFaceColor','b');
xlim([1,12]);   ylim([80,120]);
xlabel('Iteration');    ylabel('%');
ax = gca;
legend({'Cost','Utilization'},'Location','NorthWest');
set(ax,'FontSize',22);


%%
clc;close all;
LW = 1.5;
figure('Position',[500,500,500,400]);
hold on; grid on;
x = 0:.5:5;
plot(x,CM,'r-^','LineWidth',LW,'MarkerFaceColor','r');
plot(x,UM,'b-o','LineWidth',LW,'MarkerFaceColor','b');
xlim([0,5]);   ylim([80,120]);
xlabel('Distance Threshold (km)');    ylabel('%');
ax = gca;
legend({'Cost','Utilization'},'Location','NorthWest');
set(ax,'FontSize',22);


%%
h2 = plot(7,.46,'ko');      text(6,.49,'0.47','FontSize',16);
set(h1,'LineWidth',2);      set(h2,'LineWidth',1);
xlim([1,25]);   ylim([.2,.6]);
xlabel('Hour');     ylabel('Data Traffic');
legend({'Aggregated Traffic'});
ax = gca;
set(ax,'FontSize',18);
ax.XTick = 1:2:25;    ax.XTickLabel = 0:2:24;


%% plot BBU capacity load curve
clc;close all;
figure('Position',[500,500,500,300]);
hold on; grid on;
x = 0:.1:10;
y = exp(-(log(x)).*(log(x)));
h1 = plot(x,y,'k');      set(h1,'LineWidth',2);
xlim([0,4]); ylim([0,1.5]);
ax = gca;
set(ax,'FontSize',18);
xlabel('$ \frac{mean\;\mathbf{f}(C)}{ |B| } $','Interpreter','latex');     
ylabel('Capacity Utility');















