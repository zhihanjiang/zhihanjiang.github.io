%% load data
clc; clear; close all;
load('../../data/milan/BT');

Nb = size(BT,1);
Nt = size(BT,2);


%%
clc;
inputSize = 6*24;
layers = [ ...
    sequenceInputLayer(inputSize)
    lstmLayer(100,'OutputMode','last')
]


%%
maxEpochs = 150;
miniBatchSize = 7;
options = trainingOptions('sgdm', ...
    'MaxEpochs',maxEpochs, ...
    'MiniBatchSize',miniBatchSize);

net = trainNetwork(X,Y,layers,options);

