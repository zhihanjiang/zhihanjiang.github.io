# %% init
import numpy
from matplotlib import pyplot
from sklearn.metrics import mean_absolute_error
from sklearn.preprocessing import MinMaxScaler
from statsmodels.graphics.tsaplots import plot_acf
from statsmodels.tsa.arima_model import ARIMA

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
pyplot.plot(dataset[:, 10])
pyplot.show()

# %% auto correlation
feature_id = 30
X = dataset[:, feature_id]
plot_acf(X, lags=24)
pyplot.show()

size = 24 * 7 * 3
train, test = X[:size], X[size:len(X)]

predictions = numpy.zeros(24 * 7)
for t in range(0, len(test), 24):
    print t
    model = ARIMA(train, order=(4, 0, 0))
    model_fit = model.fit(disp=0)
    output = model_fit.forecast(24)
    yhat = output[0]
    predictions[t:t + 24] = yhat
    obs = test[t:t + 24]
    train = numpy.append(train, obs)
error = mean_absolute_error(test, predictions)
print('Test MAE: %.3f' % error)

# %% plot
pyplot.plot(test)
pyplot.plot(predictions, color='red')
pyplot.show()
