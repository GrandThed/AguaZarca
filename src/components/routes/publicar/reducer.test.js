import { reducer } from './reducer';

const initialState = { price: { value: '', currency: 'USD' } };

test('setPrice action updates price value', () => {
  const newState = reducer(initialState, {
    type: 'setPrice',
    field: 'value',
    value: '1234',
  });
  expect(newState.price.value).toBe('1234');
});
