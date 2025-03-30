import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReceipList from '../ReceipList';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

beforeAll(() => {
	fetchMock.enableMocks();
});

beforeEach(() => {
	fetchMock.resetMocks();
	fetchMock.mockResponse(
		JSON.stringify({
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
	);
});

const renderWithRouter = (ui: React.ReactElement) => {
	return render(<BrowserRouter>{ui}</BrowserRouter>);
};

test('renders input', async () => {
	renderWithRouter(<ReceipList />);
	const input = await screen.findByPlaceholderText(/yummy in my tommy/i);
	expect(input).toBeInTheDocument();
	await screen.findByText(/Kimchi Fried Rice/i);
});

test('filters recipes by search keyword', async () => {
	renderWithRouter(<ReceipList />);
	await screen.findByText(/Kimchi Fried Rice/i);

	const input = screen.getByPlaceholderText(/yummy/i);
	await userEvent.clear(input);
	await userEvent.type(input, 'salad');

	expect(screen.queryByText(/Kimchi Fried Rice/i)).not.toBeInTheDocument();
	expect(screen.getByText(/Chicken Salad/i)).toBeInTheDocument();
});

test('filters by vegetarian tag', async () => {
	renderWithRouter(<ReceipList />);
	await screen.findByText(/Kimchi Fried Rice/i);

	const checkbox = screen.getByLabelText(/ベジタリアン/i);
	fireEvent.click(checkbox);

	expect(screen.getByText(/Kimchi Fried Rice/i)).toBeInTheDocument();
	expect(screen.queryByText(/Chicken Salad/i)).not.toBeInTheDocument();
});

test('sorts recipes by cook time', async () => {
	renderWithRouter(<ReceipList />);
	await screen.findByText(/Kimchi Fried Rice/i);

	const sortSelect = screen.getByDisplayValue(/並び替えなし/i);
	fireEvent.change(sortSelect, { target: { value: 'cooktime' } });

	expect(screen.getByText(/Chicken Salad/i)).toBeInTheDocument();
	expect(screen.getByText(/Kimchi Fried Rice/i)).toBeInTheDocument();
});

test('shows pagination buttons', async () => {
	renderWithRouter(<ReceipList />);
	await screen.findByText(/Kimchi Fried Rice/i);

	expect(screen.getByText(/Prev/i)).toBeInTheDocument();
	expect(screen.getByText(/Next/i)).toBeInTheDocument();
});

test('adds a new recipe through the form', async () => {
	renderWithRouter(<ReceipList />);
	await screen.findByText(/Kimchi Fried Rice/i);

	const file = new File(['dummy content'], 'example.jpg', {
		type: 'image/jpeg',
	});

	fireEvent.click(screen.getByText(/NEW/i));

	fireEvent.change(screen.getByLabelText(/Name/i), {
		target: { value: 'Pasta PePe' },
	});
	fireEvent.change(screen.getByLabelText(/Image/i), {
		target: { files: [file] },
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

	fetchMock.mockResponseOnce(JSON.stringify({ id: 51 }));

	fireEvent.click(screen.getByText(/Save/i));
	screen.debug();

	await screen.findByRole('heading', { name: /Pasta PePe/i, level: 2 });
});

test('deletes a recipe when Delete button is clicked', async () => {
	renderWithRouter(<ReceipList />);
	await screen.findByText(/Kimchi Fried Rice/i);

	fetchMock.mockResponseOnce(JSON.stringify({}));

	fireEvent.click(screen.getAllByText(/Delete/i)[0]);

	await waitFor(() =>
		expect(screen.queryByText(/Kimchi Fried Rice/i)).not.toBeInTheDocument(),
	);
});

test('shows error message when fetch fails', async () => {
	fetchMock.mockRejectOnce(new Error('API failed'));

	renderWithRouter(<ReceipList />);

	await screen.findByText(/Error!/i);
});
