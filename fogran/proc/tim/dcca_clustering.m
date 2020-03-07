%% load data
clc; clear; close all;
load('../../data/milan/INTERNET');
load('../../data/milan/SID');
load('../../data/milan/BID');
BID = find(BID);

Ng = 10000;
Ns = size(SID,1);
Nb = size(BID,1);


%% assign grids to base stations
clc;
[Xs,Ys] = ind2sub([100,100],SID);
[Xb,Yb] = ind2sub([100,100],BID);
% scatter(Xs,Ys);
% scatter(Xb,Yb);

Dsb = pdist2([Xs,Ys],[Xb,Yb]);
[~,Isb] = min(Dsb,[],2);

c = jet(Nb);    ci = randperm(Nb);  c = c(ci);
scatter(Xs,Ys,10,c(Isb),'filled');

ST = INTERNET(SID,:);
STH = squeeze(sum(reshape(ST,Ns,6,size(ST,2)/6),2));
STH = STH(:,24*3+1:24*3+24*7*4);

Nh = size(STH,2);

BTH = zeros(Nb,Nh);
for h = 1:Nh
    BTH(:,h) = accumarray(Isb,STH(:,h));
end

plot(BTH(3,:));


%% select Milan base stations

M = BTH;
Th = 3e4;
M(M>Th) = Th;
histogram(M);

M = M/max(M(:));
mean(M(:))

H = M;
imagesc(H);


%% distance matrix
[I,J] = ind2sub([100,100],1:Ng);
GEODIST = squareform(pdist([J',I']));
GEODIST = GEODIST(BID,BID);
% GEODIST(GEODIST==0) = Inf;
imagesc(GEODIST);


%% DCCA Algorithm
clc;close all;tic;

DTHRES = 40;
BC = 12;

C = randperm(Nb);
for epoch = 1:8
    C0 = C;
    L = randperm(Nb);
    for bid = 1:Nb
        n = L(bid);
        [a,~,c] = unique(C);
        Nc = length(a);
        % compute utility gain
        Hc = zeros(Nc,Nh);
        for h = 1:Nh
            Hc(:,h) = accumarray(c,H(:,h));
        end
        gain_u = zeros(Nc,1);
        for ic = 1:Nc
           gain_u(ic) = (mean(Hc(ic,:))/BC)^(-log(mean(Hc(ic,:))/BC));
        end
        % compute distance constraint
        d = accumarray(c,GEODIST(n,:),[],@max);
        gain_d = exp(1) / DTHRES * d .* exp( -d / DTHRES);
%         gain = gain_u + gain_d;
        gain = gain_d;
        [v,k] = max(gain);
        C(n) = a(k);
    end
    fprintf('Epoch %d: cluster_num=%d\n',epoch,length(gain));
    if C0 == C
        break
    end
end
toc;
save('C','C');

% calculate capacity utility
utility = mean(mean(Hc,2)/BC);
deployment = Nc*BC;
fprintf('Utility=%d, Deployment=%d\n',utility,deployment);

% display clusters
Ibc = C';
Isc = zeros(Ns,1);
for i = 1:Nb
    Isc(Isb == i) = Ibc(i);
end

load('C');
G = zeros(100,100);
G(SID) = Isc;
save('G','G');
G = rot90(G);
close all;
figure('Position',[500,500,500,500]); colormap(jet);
imagesc(G);
axis off;


%%
GRID = loadjson('../../data/milan/grid.json');

%%
clc;
cm = rgb2hex(jet(Nc));
[a,~,c] = unique(C);
for i = 1:Ns
    GRID.features{1, SID(i)}.properties.color = cm(a==Isc(i),:);
end
tic;
savejson('',GRID,'../../data/milan/grid_color.json');
toc;


%%
clc;
[a,~,c] = unique(C);
lat = accumarray(c,BC(:,1),[],@mean);

lng = accumarray(c,BC(:,2),[],@mean);
scatter(lng,lat);


%%
clc;close all;
mfigure();

MB = cell(Nc,1);
DC = zeros(Nc,1);
UC = zeros(Nc,1);
for ic = 1:Nc
    n = a(ic);
    idx = find(C==n);
    MB{ic} = BSP(idx,[4,3]);
    h = H(idx,:);   hs = sum(h,1);
    DC(ic) = max(hs,[],2)/sum(max(h,[],2)); 
    UC(ic) = mean(hs)/max(hs) / (mean(mean(h,2)./max(h,[],2)));
    subplot(3,4,ic); hold on;
    plot(H(idx,:)'); %  plot(sum(H(idx,:),1)','r.-');
%     scatter(BSP(idx,4),BSP(idx,3));
    xlim([1,24]);
    BSP(idx,5) = n;
end
save('MB','MB');
mean(DC),mean(UC)
save('BSP','BSP');
dlmwrite('../data/milano_base_station_cluster.csv',BSP);
