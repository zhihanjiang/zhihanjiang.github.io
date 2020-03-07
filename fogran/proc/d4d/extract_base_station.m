%% extract base station
clear;clc;close all;

CITY = 'abidjan';
% CITY = 'dakar';

% site_id,arr_id,lon,lat
ANT_POS = dlmread(sprintf('../../data/%s/ANT_POS.CSV',CITY));
Na = max(ANT_POS(:,1)) + 1;     % +1 for id=-1 in traffic and handover
B = zeros(Na,3);
B(ANT_POS(:,1),:) = ANT_POS(:,[1,end-1,end]);

xq = B(:,2);     yq = B(:,3);
city_map = loadjson(sprintf('../../data/%s/city_border.json',CITY));
polygon = city_map.geometry.coordinates{1,1};
xv = polygon(:,1);      yv = polygon(:,2);
BID = inpolygon(xq,yq,xv,yv);
B = B(BID,:);
Nb = nnz(BID)
save(sprintf('../../data/%s/B',CITY),'B');
disp('Done.');
