%% load data
clc; clear; close all;
load('BT');

Nt = 6*24*62; 
Nh = Nt/6;


%%
layers = [ ...
    sequenceInputLayer(12)
    lstmLayer(100,'OutputMode','sequence')
]

maxEpochs = 150;
miniBatchSize = 27;
options = trainingOptions('sgdm', ...
    'MaxEpochs',maxEpochs, ...
    'MiniBatchSize',miniBatchSize);

net = trainNetwork(X,Y,layers,options);

