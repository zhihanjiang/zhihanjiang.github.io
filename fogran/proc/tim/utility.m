%%
clc; clear; close all;

load('../../data/milan/INTERNET');
load('../../data/milan/SID.mat');


%% select Milano base stations
M = INTERNET(SID,:);
Nm = size(M,1);

Th = 500;
M(M>Th) = Th;
Mn = M/max(M(:));

mean(Mn(:))
