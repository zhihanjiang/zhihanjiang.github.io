%% load data
clc; clear; close all;
load('INTERNET');
load('BID');
load('SID');

Ng = 10000; 
Nt = 6*24*62; 
Nh = Nt/6;


%% select Milan base stations
clc;
BT = INTERNET(BID,:);
Nb = size(BT,1);


%% aggregate by hour, extract 4 good weeks (2013/11/04 -- 2013/12/01)
clc;
BTH = squeeze(sum(reshape(BT,Nb,6,Nh),2));
BTH = BTH(:,24*3+1:24*3+24*7*4);
% BTHw = BTH(:,[1:120,169:288,337:456,505:624]);
% BTHn = BTH(:,[121:168,289:336,457:504,625:672]);
save('../data/BTH','BTH');
fwrite(fopen('../data/traffic.bin','w'),BTH','double','ieee-le');


%% random grid traffic pattern
h = H(randi(Nm),:);
clc; close all; figure('Position',[500,500,500,300]);
plot(h,'g','LineWidth',2);
xlim([1,24]);
ax = gca; 
ax.XTick = 1:2:24; 
ax.XTickLabel = 0:2:24;
grid on; set(gca,'FontSize', 15);


%% distance matrix
[I,J] = ind2sub([100,100],1:Ng);
GEODIST = squareform(pdist([J',I']));
GEODIST = GEODIST(SID,SID);
GEODIST(GEODIST==0) = Inf;
imagesc(GEODIST);



