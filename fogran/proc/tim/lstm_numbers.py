# %%
from random import randint

import numpy
from keras.layers import LSTM, Dense
from keras.models import Sequential
from keras.utils import np_utils


def generate_sequence(length, scope):
    return numpy.array([randint(0, scope - 1) for _ in range(length)])


def generate_example(length, scope, target):
    # generate sequence
    sequence = generate_sequence(length, scope)
    # reshape sequence to be 3D
    X = sequence.reshape((1, length, 1))
    # select output
    y = np_utils.to_categorical([sequence[target]], scope)
    return X, y


# test sequence generation
length = 5
scope = 10
target = 1
X, y = generate_example(length, scope, target)
print X, y


# %% define model
model = Sequential()
model.add(LSTM(25, input_shape=(length, 1)))
model.add(Dense(scope, activation='softmax'))
model.compile(loss='categorical_crossentropy',
              optimizer='adam', metrics=['acc'])
print(model.summary())

# %% fit model
print "Training the model..."
for i in range(10):
    X, y = generate_example(length, scope, target)
    model.fit(X, y, epochs=1, verbose=0)
print "Done."

# %% evaluate model
correct = 0
times = 100
for i in range(times):
    X, y = generate_example(length, scope, target)
    y_hat = model.predict(X)
    # print y.argmax(axis=-1), y_hat.argmax(axis=-1)
    if y.argmax(axis=-1) == y_hat.argmax(axis=-1):
        correct += 1
print('Accuracy: %f' % ((correct * 1.0 / times) * 100.0))

# %% prediction on new data
X, y = generate_example(length, scope, target)
y_hat = model.predict(X)
print('Sequence:  %s' % X)
print('Expected:  %s' % y.argmax(axis=-1))
print('Predicted: %s' % y_hat.argmax(axis=-1))
