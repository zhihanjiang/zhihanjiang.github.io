import numpy
from matplotlib import pyplot
from pandas.plotting import autocorrelation_plot
from sklearn.metrics import mean_squared_error
from statsmodels.graphics.tsaplots import plot_acf
from statsmodels.tsa.ar_model import AR

# %% load the dataset
dataset = numpy.fromfile(open('../data/traffic.bin', 'rb'),
                         dtype=numpy.float64).reshape(182, 1344)
print dataset.shape
dataset = dataset.astype('float32')

# %% plot auto correlation
bid = 10
series = dataset[[bid]].transpose()
autocorrelation_plot(series)
pyplot.show()

window = 2 * 24 * 14
plot_acf(series, lags=window)
pyplot.show()
pyplot.plot(series[:window])
pyplot.show()

# %% AR model
X = series
window = 2 * 24 * 7
train, test = X[1:len(X) - window], X[len(X) - window:]
model = AR(train)
model_fit = model.fit()
print('Lag: %s' % model_fit.k_ar)
print('Coefficients: %s' % model_fit.params)
# make predictions
predictions = model_fit.predict(
    start=len(train), end=len(train) + len(test) - 1, dynamic=False)
for i in range(len(predictions)):
    print('predicted=%f, expected=%f' % (predictions[i], test[i]))
error = mean_squared_error(test, predictions)
print('Test MSE: %.3f' % error)
# plot results
pyplot.plot(test)
pyplot.plot(predictions, color='red')
pyplot.show()
