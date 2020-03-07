%% load data
clc;clear;close all;tic;

CITY = 'abidjan';
% CITY = 'dakar';

load(sprintf('../../data/%s/B',CITY));

% D4D I
START_TIME  =   datetime('2011-12-05 00:00:00');
END_TIME    =   datetime('2012-04-23 00:00:00');
Nh          =   hours(END_TIME - START_TIME);
Nb          =   1239; % 1238 + 1: for -1 -> 1239

% D4D II
% START_TIME  =   datetime('2013-01-01 00:00:00');
% END_TIME    =   datetime('2014-01-01 00:00:00');
% Nh          =   hours(END_TIME - START_TIME);
% Nb          =   1667; % 1666 + 1: for -1 -> 1667

toc;


%% extract call tensors
clc;

TRAFFIC = zeros(Nb,Nh);

for i = 0:9
% for i = 1:12
    tic;

    % abidjan
    fn = sprintf('/Volumes/CHIPFANCIER/data/abidjan/call/SET1TSV_%d.TSV',i);
    disp(['Processing ', fn]);
    fid = fopen(fn);
    data = textscan(fid,'%d-%d-%d %d:%d:%d\t%d\t%d\t%d\t%d');
    hid = hours(datetime(data{1},data{2},data{3},data{4},data{5},data{6}) - START_TIME) + 1;

    % dakar
%     fn = sprintf('/Volumes/SSD/Data/D4D_II/SET1/SET1V_%02d.CSV',i);
%     disp(['Processing ', fn]);
%     fid = fopen(fn);
%     data = textscan(fid,'%d-%d-%d %d,%d,%d,%d,%d');
%     hid = hours(datetime(data{1},data{2},data{3},data{4},0,0) - START_TIME) + 1;

    sid = data{7};          sid(sid == -1) = Nb;
    eid = data{8};          eid(eid == -1) = Nb;
    calldur = data{10};
    for j = 1:length(hid)
        TRAFFIC(sid(j),hid(j)) = TRAFFIC(sid(j),hid(j)) + calldur(j);
        TRAFFIC(eid(j),hid(j)) = TRAFFIC(eid(j),hid(j)) + calldur(j);
    end
    toc;
end

T = TRAFFIC(BID,:);
save(sprintf('../../data/%s/T',CITY),'T');
toc;


%% show overall traffic pattern
clc;

tl = START_TIME:hours(1):END_TIME;
ct = squeeze(sum(T,1));

figure();
bar(tl(1:end-1),ct);
grid on;




