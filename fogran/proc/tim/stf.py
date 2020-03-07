# %% init
from random import randint
from matplotlib import pyplot
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
pyplot.plot(dataset[:, 7])
pyplot.show()

# %% prepare data
train_size = time_steps * 7 * 3
test_size = time_steps * 7 * 1
train, test = dataset[:train_size, :], dataset[-test_size:, :]
print train.shape, test.shape

trainX, trainY = train[:-time_steps, :], train[time_steps:, :]
testX, testY = test[:-time_steps, :], test[time_steps:, :]
print trainX.shape, trainY.shape, testX.shape, testY.shape

# reshape input to be [samples, time steps, features]
trainX = numpy.reshape(trainX, (-1, time_steps, feature_size))
trainY = numpy.reshape(trainY, (-1, time_steps, feature_size))
testX = numpy.reshape(testX, (-1, time_steps, feature_size))
testY = numpy.reshape(testY, (-1, time_steps, feature_size))
print trainX.shape, trainY.shape, testX.shape, testY.shape

# plot and validate
pyplot.plot(testX[1, :, 30])
pyplot.plot(testY[0, :, 30])
pyplot.show()

# %% define the model
hidden_size = 32
model = Sequential()
model.add(LSTM(hidden_size, input_shape=(
    time_steps, feature_size), return_sequences=True))
model.add(LSTM(feature_size, input_shape=(
    time_steps, hidden_size), return_sequences=True))
model.compile(loss='mae', optimizer='adam')
print(model.summary())

# fit model
model.fit(trainX, trainY, epochs=100, batch_size=2)
# evaluate model
loss = model.evaluate(testX, testY, verbose=0)
print('MAE: %f' % loss)

# %% predict and plot
testYhat = model.predict(testX, verbose=0)
img = testY.reshape(testY.shape[0] * testY.shape[1], -1)
pyplot.imshow(img)
pyplot.show()
img = testYhat.reshape(testYhat.shape[0] * testYhat.shape[1], -1)
pyplot.imshow(img)
pyplot.show()

# %% random base station
# feature_id = randint(0, feature_size)
feature_id = 154 - 1

pyplot.plot(test[24:, feature_id], 'b')
img = testY.reshape(testY.shape[0] * testY.shape[1], -1)
pyplot.plot(img[:, feature_id], 'r')
img = testYhat.reshape(testYhat.shape[0] * testYhat.shape[1], -1)
pyplot.plot(img[:, feature_id], 'g')
pyplot.show()

# %% random day and base station
sample_id = randint(0, testY.shape[0] - 1)
feature_id = randint(0, feature_size)
print sample_id, feature_id, testY.shape[0]
pyplot.plot(testY[sample_id, :, feature_id], 'r')
pyplot.plot(testYhat[sample_id, :, feature_id], 'g')
pyplot.show()
