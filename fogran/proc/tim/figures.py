# %% init
from random import randint
import matplotlib
import numpy
from keras.layers import LSTM
from keras.models import Sequential
from matplotlib import pyplot
from sklearn.preprocessing import MinMaxScaler

# %% load dataset: 182 base stations, 4 weeks, hourly traffic
feature_size = 182
time_steps = 24
dataset = numpy.fromfile(open('../data/traffic.bin', 'rb'),
                         dtype=numpy.float64).reshape(feature_size, time_steps * 7 * 4)
dataset = dataset.transpose()
# normalize the dataset
scaler = MinMaxScaler(feature_range=(0, 1))
dataset = scaler.fit_transform(dataset)
print dataset.shape

# %%
feature_id = randint(0, feature_size - 1)
pyplot.plot(dataset[:24, feature_id])
pyplot.show()
print feature_id

# %% plot traffic
matplotlib.rc('font', size=16)
fig = pyplot.figure(figsize=[7, 4.5])
pyplot.plot(dataset[:24, 153], 'b', label='Business Area')
pyplot.plot(dataset[:24, 3], 'r--', label='Residential Area')
pyplot.scatter(13, .64, s=80, c='k', marker='^')
pyplot.scatter(20, .84, s=80, c='k', marker='^')
pyplot.text(13, .65, '0.65')
pyplot.text(20, .85, '0.85')

pyplot.xlabel('Hour')
pyplot.xticks(numpy.arange(0, 26, 2))
pyplot.ylabel('Data Traffic Volume')
pyplot.ylim([0, 1])
pyplot.legend()
pyplot.show()
fig.savefig('../figures/traffic_separate.png', dpi=300)

# plot traffic
data = dataset[:24, 3] + dataset[:24, 153]
matplotlib.rc('font', size=16)
fig = pyplot.figure(figsize=[7, 4.5])
pyplot.plot(data, 'g', label='Aggregated Traffic')
pyplot.scatter(20, 1.1, s=80, c='k', marker='^')
pyplot.text(20, 1.1, '1.10')
pyplot.xlabel('Hour')
pyplot.xticks(numpy.arange(0, 26, 2))
pyplot.ylabel('Data Traffic Volume')
pyplot.ylim([0, 1.5])
pyplot.legend()
pyplot.show()
fig.savefig('../figures/traffic_aggregate.png', dpi=300)
