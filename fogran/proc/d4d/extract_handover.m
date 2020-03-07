%% load data
clc;clear;close all;

CITY = 'abidjan';
load(sprintf('../../data/%s/BID',CITY));

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

ratio       =   1; % 5,000,000 / 50,000 = 100 due to random sampling


%% extract handover tensor: symetric
clc;

HANDOVER = zeros(Nb,Nb,Nh);

for i = 0:9
    tic;
    % D4D I
    fn = sprintf('/Volumes/CHIPFANCIER/data/abidjan/mobility/POS_SAMPLE_%d.TSV',i);
    disp(['Processing ', fn]);
    fid = fopen(fn);
    data = textscan(fid,'%d\t%d-%d-%d %d:%d:%d\t%d');

%     D4D II
%     fn = sprintf('/Volumes/SSD/Data/D4D-II/SET2/SET2_P%02d.CSV',i);
%     disp(['Processing ', fn]);
%     fid = fopen(fn);
%     data = textscan(fid,'%d,%d-%d-%d %d:%d:%d,%d');

    % process data in a vectorized way
    uid = data{1};
    hid = hours(datetime(data{2},data{3},data{4},data{5},data{6},data{7}) - START_TIME) + 1;
    bid = data{8};  bid(bid == -1) = Nb;
    % detect handover events
    for k = 1:length(uid)-1
        if (uid(k) == uid(k+1)) && (bid(k) ~= bid(k+1))
            hidm = floor((hid(k) + hid(k+1))/2);
            HANDOVER(bid(k),bid(k+1),hidm) = HANDOVER(bid(k),bid(k+1),hidm) + ratio;
            HANDOVER(bid(k+1),bid(k),hidm) = HANDOVER(bid(k+1),bid(k),hidm) + ratio;
        end
    end
    toc;
end
disp('Done.');

% save handover in Dakar
H = HANDOVER(BID,BID,:);

%%
clc;tic;
save(sprintf('../../data/%s/H',CITY),'H','-v7.3');
toc;


%% show overall handover pattern
clc;
tl = START_TIME:hours(1):END_TIME;
ch = squeeze(sum(sum(H,1),2));

figure();
bar(tl(1:end-1),ch);
grid on;

figure();
hi = sum(H,3);
imagesc(hi);
