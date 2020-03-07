%% load data
clc;clear;close all;

load('../../data/abidjan/H');

Nb = size(L,1);


%% distribution: zero-inflated negative binomial  
clc;

h = squeeze(H(150,151,:));
disp(nnz(h));
disp([mean(h), var(h), mean(h) < var(h)]);
% h = squeeze(H(68,135,:));

mfigure();
subplot(2,2,1);     bar(h);
xlabel('Time');     ylabel('Number');  title('Handover Series');
subplot(2,2,2);     histfit(h,[],'Negative Binomial');
xlabel('Number');   ylabel('Probability');  title('Negative Binomial Fit');
subplot(2,2,3);     histfit(h,[],'Exponential');   % set(gca,'YScale','log');  
xlabel('Number');   ylabel('Probability');  title('Exponential Fit');
subplot(2,2,4);     histfit(h,[],'Poisson');
xlabel('Number');   ylabel('Probability');  title('Poisson Fit');


%% 
clc; close all;

% MR = zeros(Nb,Nb);
% MP = zeros(Nb,Nb);
for i = 1:Nb
    disp(i);
    for j = i+1:Nb
        ho = squeeze(H(i,j,:));
        h = nonzeros(ho);
        if mean(h) < var(h)
%             rp = nbinfit(h);
%             MR(i,j) = rp(1);
%             MP(i,j) = rp(2);
            
        end
    end
end

disp([nnz(MR), nnz(MP)]);


%%
clc;

mask = MP > 0;



%%
H = H .* mask;
L = sum(H,3);
nnz(L)

