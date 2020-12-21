import * as ActionTypes from '../ActionTypes';

interface AddDishesAction {
  type: typeof ActionTypes.ADD_DISHES;
  payload: string;
}

interface DishesLoadingAction {
  type: typeof ActionTypes.DISHES_LOADING;
  payload: string;
}

interface DishesFailedAction {
  type: typeof ActionTypes.DISHES_FAILED;
  payload: string;
}

type DishesActionType = AddDishesAction | DishesLoadingAction | DishesFailedAction;

export const Dishes = (
  state = { isLoading: true, errMess: null, dishes: [] },
  action: DishesActionType
) => {
  switch (action.type) {
    case ActionTypes.ADD_DISHES:
      return {
        ...state,
        isLoading: false,
        errMess: null,
        dishes: action.payload,
      };

    case ActionTypes.DISHES_LOADING:
      return { ...state, isLoading: true, errMess: null, dishes: [] };

    case ActionTypes.DISHES_FAILED:
      return { ...state, isLoading: false, errMess: action.payload };

    default:
      return state;
  }
};
