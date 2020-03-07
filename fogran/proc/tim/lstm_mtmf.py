import keras.layers as L
import keras.models as M
import numpy

# The inputs to the model.
# We will create two data points, just for the example.
data_x = numpy.array([
    # Datapoint 1
    [
        # Input features at timestep 1
        [1, 2, 3],
        # Input features at timestep 2
        [4, 5, 6]
    ],
    # Datapoint 2
    [
        # Features at timestep 1
        [7, 8, 9],
        # Features at timestep 2
        [10, 11, 12]
    ]
])

# The desired model outputs.
# We will create two data points, just for the example.
data_y = numpy.array([
    # Datapoint 1
    [
        # Target features at timestep 1
        [101, 102, 103, 104],
        # Target features at timestep 2
        [105, 106, 107, 108]
    ],
    # Datapoint 2
    [
        # Target features at timestep 1
        [201, 202, 203, 204],
        # Target features at timestep 2
        [205, 206, 207, 208]
    ]
])

# Each input data point has 2 timesteps, each with 3 features.
# So the input shape (excluding batch_size) is (2, 3), which
# matches the shape of each data point in data_x above.
model_input = L.Input(shape=(2, 3))

# This RNN will return timesteps with 4 features each.
# Because return_sequences=True, it will output 2 timesteps, each
# with 4 features. So the output shape (excluding batch size) is
# (2, 4), which matches the shape of each data point in data_y above.
model_output = L.LSTM(4, return_sequences=True)(model_input)

# Create the model.
model = M.Model(input=model_input, output=model_output)

# You need to pick appropriate loss/optimizers for your problem.
# I'm just using these to make the example compile.
model.compile('sgd', 'mean_squared_error')

# Train
model.fit(data_x, data_y)
