%% load data
clc;clear;close all;tic;

CITY = 'abidjan';
% CITY = 'dakar';

disp('Loading...');
load(sprintf('../../data/%s/B',CITY));
load(sprintf('../../data/%s/T',CITY));
load(sprintf('../../data/%s/H',CITY));
toc;

Nb = size(T,1);
Nh = size(T,2);


%% extract base stations with stable traffic
clc;

[~,I] = sort(T,2);
e = ones(Nb,1) * Nh;
for b = 1:Nb
    for h = 1:Nh-1
        if I(b,h) >= I(b,h+1)
            e(b) = h;
            break;
        end
    end
end
[~,ie] = sort(e);

% D4D I
START_TIME  	=   datetime('2011-12-05 00:00:00');
FROM_TIME       =   datetime('2011-12-19 00:00:00');
TO_TIME         =   datetime('2012-01-30 00:00:00');

% D4D II
% START_TIME      =   datetime('2013-01-01 00:00:00');
% FROM_TIME       =   datetime('2013-04-01 00:00:00');
% TO_TIME         =   datetime('2013-07-01 00:00:00');

hs              =   hours(FROM_TIME - START_TIME) + 1;
ht              =   hours(TO_TIME - START_TIME);

% abidjan
bid = ie(1:end-103);
hid = 24*7*2 + 1:Nh - 24*7*12;
% dakar
% bid = ie(1:end-30);
% hid = hs:ht;

m = sum(T(bid,:) == 0,2);

close all; figure();
subplot(2,2,1);     imagesc(T(ie,:));
subplot(2,2,2);     imagesc(T(bid,hid));
% subplot(2,2,3:4);   bar(mean(T(bid,hid),2));
subplot(2,2,3:4);   bar(m,2);


%% !!! RUN ONLY ONCE !!!
clc;tic;
B = B(bid,:);
T = T(bid,hid);
H = H(bid,bid,hid);
toc;


%% extract handovers following the ZINB distribution
clc; tic;

Nb = size(T,1);
Nh = size(T,2);

MR = zeros(Nb,Nb);
MP = zeros(Nb,Nb);
for j = 1:Nb
    disp(j);
    for i = 1:Nb
        ho = squeeze(H(i,j,:));
        h = nonzeros(ho);
        if mean(h) < var(h)
            rp = nbinfit(h);
            MR(i,j) = rp(1);
            MP(i,j) = rp(2);
        end
    end
end

disp([nnz(MR), nnz(MP)]);


%% !!! RUN ONLY ONCE !!!
clc; tic;

mask = MP > 0;
H = H .* mask;

toc;


%% save results: selected
clc;tic;

disp('Saving...');
save(sprintf('../../data/%s/B',CITY),'B');
fwrite(fopen(sprintf('../../data/%s/base_station.bin',CITY),'w'),B,'double','ieee-le');
save(sprintf('../../data/%s/T',CITY),'T');
fwrite(fopen(sprintf('../../data/%s/traffic.bin',CITY),'w'),T,'double','ieee-le');
save(sprintf('../../data/%s/H',CITY),'H');
fwrite(fopen(sprintf('../../data/%s/handover.bin',CITY),'w'),H,'double','ieee-le');
toc;
