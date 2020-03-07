# %% Stacked LSTM for international airline passengers problem with memory
import numpy
import math
# import matplotlib.pyplot as plt
from pandas import read_csv
from scipy.io import loadmat
from keras.models import Sequential
from keras.layers import Dense
from keras.layers import LSTM
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

# %% convert an array of values into a data matrix
def create_data(data, look_back=1):
	dataX, dataY = [], []
	for i in range(len(data)-look_back-1):
		a = data[i:(i+look_back), 0]
		dataX.append(a)
		dataY.append(data[i + look_back, 0])
	return numpy.array(dataX), numpy.array(dataY)

# %% load the data
dataset = numpy.fromfile(open('../data/traffic.bin', 'rb'),dtype=numpy.float64).reshape(182,1344)
print(dataset.shape)
# plt.plot(dataset.transpose())
# plt.show()

# %% normalize the data
bid = 10
data = dataset[[bid]].transpose()
scaler = MinMaxScaler(feature_range=(0, 1))
data = scaler.fit_transform(data)
# % split into train and test sets
train_size = int(len(data) * 0.67)
test_size = len(data) - train_size
train, test = data[0:train_size,:], data[train_size:len(data),:]
# % reshape into X=t and Y=t+1
look_back = 8
trainX, trainY = create_data(train, look_back)
testX, testY = create_data(test, look_back)
# % reshape input to be [samples, time steps, features]
trainX = numpy.reshape(trainX, (trainX.shape[0], trainX.shape[1], 1))
testX = numpy.reshape(testX, (testX.shape[0], testX.shape[1], 1))
print(trainX.shape,trainY.shape,testX.shape,testY.shape)

# %% create and fit the LSTM network
batch_size = 1
model = Sequential()
model.add(LSTM(4, batch_input_shape=(batch_size, look_back, 1), stateful=True, return_sequences=True))
model.add(LSTM(4, batch_input_shape=(batch_size, look_back, 1), stateful=True))
model.add(Dense(1))
model.compile(loss='mean_squared_error', optimizer='adam')
for i in range(4):
	model.fit(trainX, trainY, epochs=1, batch_size=batch_size, verbose=2, shuffle=False)
	model.reset_states()
	print(i)

# %% make predictions
trainPredict = model.predict(trainX, batch_size=batch_size)
model.reset_states()
testPredict = model.predict(testX, batch_size=batch_size)
# % invert predictions
trainPredict = scaler.inverse_transform(trainPredict)
trainY = scaler.inverse_transform([trainY])
testPredict = scaler.inverse_transform(testPredict)
testY = scaler.inverse_transform([testY])
# % calculate root mean squared error
trainScore = math.sqrt(mean_squared_error(trainY[0], trainPredict[:,0]))
print('Train Score: %.2f RMSE' % (trainScore))
testScore = math.sqrt(mean_squared_error(testY[0], testPredict[:,0]))
print('Test Score: %.2f RMSE' % (testScore))

# %% shift train predictions for plotting
trainPredictPlot = numpy.empty_like(data)
trainPredictPlot[:, :] = numpy.nan
trainPredictPlot[look_back:len(trainPredict)+look_back, :] = trainPredict
# % shift test predictions for plotting
testPredictPlot = numpy.empty_like(data)
testPredictPlot[:, :] = numpy.nan
testPredictPlot[len(trainPredict)+(look_back*2)+1:len(data)-1, :] = testPredict
# save back
prediction = dataset
prediction[bid] = testPredictPlot[:,0]
prediction.tofile(open('../data/prediction.bin', 'wb'))

# %% plot baseline and predictions
# plt.plot(scaler.inverse_transform(data))
# plt.plot(trainPredictPlot)
# plt.plot(testPredictPlot)
# plt.show()
