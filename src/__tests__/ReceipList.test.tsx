import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReceipList from '../ReceipList';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

// 테스트 해야할 것

// 1) 페이지가 잘 렌더링 되는지(헤더, 입력창)
// 2) 검색이 잘 되는지
// 3) 필터, 옵션이 잘 되는지
// 4) 페이지네이션 되는지
// 5) 로딩, 에러 제대로 뜨는지
// 6) 레시피 추가, 삭제 잘 되는지

// ✅ fetch mocking
beforeEach(() => {
	global.fetch = jest.fn(() =>
		Promise.resolve({
			json: () =>
				Promise.resolve({
					recipes: [
						{
							id: 1,
							name: 'Kimchi Fried Rice',
							image: 'https://example.com/kimchi.jpg',
							cuisine: 'Korean',
							caloriesPerServing: 500,
							cookTimeMinutes: 15,
							ingredients: ['rice', 'kimchi'],
							instructions: ['Mix', 'Fry'],
							tags: ['Vegetarian'],
						},
						{
							id: 2,
							name: 'Chicken Salad',
							image: 'https://example.com/salad.jpg',
							cuisine: 'American',
							caloriesPerServing: 350,
							cookTimeMinutes: 10,
							ingredients: ['chicken', 'lettuce'],
							instructions: ['Chop', 'Mix'],
							tags: ['Salad'],
						},
					],
				}),
		}),
	);
});

afterEach(() => {
	jest.clearAllMocks();
});

const renderWithRouter = (ui) => {
	return render(<BrowserRouter>{ui}</BrowserRouter>);
};

// ✅ 기본 렌더링
test('renders input', async () => {
	renderWithRouter(<ReceipList />);
	const input = await screen.findByPlaceholderText(/yummy in my tommy/i);
	expect(input).toBeInTheDocument();
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));
});

// ✅ 검색 필터
test('filters recipes by search keyword', async () => {
	renderWithRouter(<ReceipList />);
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));
	const input = screen.getByPlaceholderText(/yummy/i);
	await userEvent.type(input, 'salad');

	expect(screen.queryByText(/Kimchi Fried Rice/i)).not.toBeInTheDocument();
	expect(screen.getByText(/Chicken Salad/i)).toBeInTheDocument();
});

// ✅ 채식 필터
test('filters by vegetarian tag', async () => {
	renderWithRouter(<ReceipList />);
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));
	const checkbox = screen.getByLabelText(/Vegeterian Only/i);
	fireEvent.click(checkbox);

	expect(screen.getByText(/Kimchi Fried Rice/i)).toBeInTheDocument();
	expect(screen.queryByText(/Chicken Salad/i)).not.toBeInTheDocument();
});

// ✅ 정렬: cook time
test('sorts recipes by cook time', async () => {
	renderWithRouter(<ReceipList />);
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));
	const sortSelect = screen.getByDisplayValue('No Sorting');
	fireEvent.change(sortSelect, { target: { value: 'cooktime' } });

	expect(screen.getByText(/Chicken Salad/i)).toBeInTheDocument();
	expect(screen.getByText(/Kimchi Fried Rice/i)).toBeInTheDocument();
});

// ✅ 페이지네이션이 표시되는지
test('shows pagination buttons', async () => {
	renderWithRouter(<ReceipList />);
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));
	expect(screen.getByText(/Prev/i)).toBeInTheDocument();
	expect(screen.getByText(/Next/i)).toBeInTheDocument();
});

test('adds a new recipe through the form', async () => {
	renderWithRouter(<ReceipList />);
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));

	// Add Recipe 버튼 클릭
	const addButton = screen.getByText(/Add Recipe/i);
	fireEvent.click(addButton);

	// 모달 열림 + 입력
	fireEvent.change(screen.getByLabelText(/Name/i), {
		target: { value: 'Test Pasta' },
	});
	fireEvent.change(screen.getByLabelText(/Image/i), {
		target: { value: 'https://example.com/pasta.jpg' },
	});
	fireEvent.change(screen.getByLabelText(/Cuisine/i), {
		target: { value: 'Italian' },
	});
	fireEvent.change(screen.getByLabelText(/Calories/i), {
		target: { value: '600' },
	});
	fireEvent.change(screen.getByLabelText(/Cook Time/i), {
		target: { value: '20' },
	});
	fireEvent.change(screen.getByLabelText(/Ingredients/i), {
		target: { value: 'pasta, tomato' },
	});
	fireEvent.change(screen.getByLabelText(/Instructions/i), {
		target: { value: 'Boil\nSauce' },
	});
	fireEvent.change(screen.getByLabelText(/Tags/i), {
		target: { value: 'Italian, Vegetarian' },
	});

	// 가짜 POST 응답
	global.fetch.mockResolvedValueOnce({
		json: async () => ({ id: 999 }),
	});

	// 저장 버튼 클릭
	const saveBtn = screen.getByText(/Save/i);
	fireEvent.click(saveBtn);

	// 새로운 레시피가 목록에 생겼는지 확인
	await waitFor(() => screen.getByText(/Test Pasta/i));
});

test('deletes a recipe when Delete button is clicked', async () => {
	renderWithRouter(<ReceipList />);
	await waitFor(() => screen.getByText(/Kimchi Fried Rice/i));

	// 삭제 mock 응답
	global.fetch.mockResolvedValueOnce({
		json: async () => ({}),
	});

	const deleteButton = screen.getAllByText(/Delete/i)[0];
	fireEvent.click(deleteButton);

	await waitFor(() =>
		expect(screen.queryByText(/Kimchi Fried Rice/i)).not.toBeInTheDocument(),
	);
});

test('shows error message when fetch fails', async () => {
	global.fetch.mockRejectedValueOnce(new Error('API failed'));

	renderWithRouter(<ReceipList />);

	await waitFor(() => expect(screen.getByText(/Error!/i)).toBeInTheDocument());
});
