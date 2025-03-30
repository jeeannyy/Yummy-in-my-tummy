import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './ReceipList.css';

type Recipe = {
	id: number;
	name: string;
	image: File | null;
	cuisine: string;
	caloriesPerServing: number;
	cookTimeMinutes: number;
	ingredients: string[];
	instructions: string[];
	tags: string[];
};

type FormData = {
	name: string;
	image: File | null;
	cuisine: string;
	caloriesPerServing: string;
	cookTimeMinutes: string;
	ingredients: string;
	instructions: string;
	tags: string;
};

function ReceipList() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);

	const category = searchParams.get('tag');

	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const searchedValue = searchParams.get('search') || '';
	const selectedCuisine = searchParams.get('cuisine') || 'All';
	const isVegetarian = searchParams.get('vegetarian') === 'true';
	const sortOption = searchParams.get('sort') || 'none';

	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [showForm, setShowForm] = useState<boolean>(false);
	const [formData, setFormData] = useState<FormData>({
		name: '',
		tags: '',
		image: null,
		cuisine: '',
		caloriesPerServing: '',
		cookTimeMinutes: '',
		ingredients: '',
		instructions: '',
	});

	const [currentPage, setCurrentPage] = useState<number>(1);
	const itemsPerPage = 6;

	useEffect(() => {
		if (!loading) {
			inputRef.current?.focus();
		}
	}, [loading]);

	useEffect(() => {
		const fetchRecipes = async () => {
			setLoading(true);

			try {
				const response = await fetch('https://dummyjson.com/recipes');
				const data = await response.json();
				setRecipes(data.recipes);
			} catch (error) {
				console.log(error, '<<error');
				setError('Error!');
			} finally {
				setLoading(false);
			}
		};
		fetchRecipes();
	}, []);

	const filteredRecipes = useMemo(() => {
		let updatedRecipes = [...recipes];

		if (category) {
			updatedRecipes = updatedRecipes.filter((recipe) =>
				recipe.tags
					.map((tag) => tag.toLowerCase())
					.includes(category.toLowerCase()),
			);
		}

		if (searchedValue) {
			updatedRecipes = updatedRecipes.filter((recipe) =>
				recipe.name.toLowerCase().includes(searchedValue.toLowerCase().trim()),
			);
		}

		if (selectedCuisine !== 'All') {
			updatedRecipes = updatedRecipes.filter(
				(recipe) =>
					recipe.cuisine.toLowerCase() === selectedCuisine.toLowerCase(),
			);
		}

		if (isVegetarian) {
			updatedRecipes = updatedRecipes.filter((recipe) =>
				recipe.tags.includes('Vegetarian'),
			);
		}

		if (sortOption === 'calories') {
			updatedRecipes = updatedRecipes.sort(
				(a, b) => a.caloriesPerServing - b.caloriesPerServing,
			);
		} else if (sortOption === 'cooktime') {
			updatedRecipes = updatedRecipes.sort(
				(a, b) => a.cookTimeMinutes - b.cookTimeMinutes,
			);
		}

		setCurrentPage(1);

		return updatedRecipes;
	}, [
		recipes,
		searchedValue,
		selectedCuisine,
		isVegetarian,
		sortOption,
		category,
	]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSearch = e.target.value;
		searchParams.set('search', newSearch);
		setSearchParams(searchParams);
	};

	const handleCuisineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		searchParams.set('cuisine', e.target.value);
		setSearchParams(searchParams);
	};

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		searchParams.set('sort', e.target.value);
		setSearchParams(searchParams);
	};

	const handleVegetarianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		searchParams.set('vegetarian', String(e.target.checked));
		setSearchParams(searchParams);
	};

	const handleEdit = (recipe: Recipe) => {
		setEditingId(recipe.id);
		setFormData({
			name: recipe.name,
			image: recipe.image,
			cuisine: recipe.cuisine,
			caloriesPerServing: String(recipe.caloriesPerServing),
			cookTimeMinutes: String(recipe.cookTimeMinutes),
			ingredients: recipe.ingredients.join(', '),
			instructions: recipe.instructions.join('\n'),
			tags: recipe.tags.join(', '),
		});
		setIsEditing(true);
		setShowForm(true);
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch(`https://dummyjson.com/recipes/${id}`, {
				method: 'DELETE',
			});

			setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));
			alert('Your recipe is deleted!');
		} catch (error) {
			console.log(error);
		}
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const newRecipe = {
			name: formData.name,
			image: formData.image,
			cuisine: formData.cuisine,
			caloriesPerServing: Number(formData.caloriesPerServing),
			cookTimeMinutes: Number(formData.cookTimeMinutes),
			ingredients: formData.ingredients
				.split(',')
				.map((item) => item.trim())
				.filter(Boolean),
			instructions: formData?.instructions
				.split('\n')
				.map((line) => line.trim())
				.filter(Boolean),
			tags: formData?.tags
				.split(',')
				.map((tag) => tag.trim())
				.filter(Boolean),
		};

		try {
			let response, data;

			if (isEditing) {
				response = await fetch(`https://dummyjson.com/recipes/${editingId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newRecipe),
				});
				data = await response.json();

				setRecipes((prev) =>
					prev.map((item) =>
						item.id === editingId ? { ...item, ...newRecipe } : item,
					),
				);
			} else {
				response = await fetch(`https://dummyjson.com/recipes/add`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						id: Date.now(),
						...newRecipe,
					}),
				});
				data = await response.json();

				const recipeWithId = { ...newRecipe, id: data.id };
				setRecipes((prev) => [recipeWithId, ...prev]);
			}
		} catch (error) {
			console.log(error, '<<error');
		} finally {
			setFormData({
				name: '',
				image: null,
				cuisine: '',
				caloriesPerServing: '',
				cookTimeMinutes: '',
				ingredients: '',
				instructions: '',
				tags: '',
			});
			setIsEditing(false);
			setEditingId(null);
			setShowForm(false);
		}
	};

	const paginated = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredRecipes.slice(start, end);
	}, [filteredRecipes, currentPage]);

	const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
	const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

	if (loading) return <p>Loading...</p>;

	if (error) return <p>{error}</p>;

	return (
		<>
			<div className='header-container'>
				<Link to={'/recipes'} className='recipe-link'>
					<h1 className='title-header'>レシピ</h1>
				</Link>

				<div className='search-container'>
					<input
						ref={inputRef}
						type='text'
						placeholder='yummy in my tommy'
						value={searchedValue}
						onChange={handleInputChange}
					/>
				</div>
			</div>
			<div className='filter-container'>
				<select value={selectedCuisine} onChange={handleCuisineChange}>
					<option value='All'>すべてのレシピ</option>
					<option value='Asian'>Asian</option>
					<option value='Korean'>Korean</option>
					<option value='Italian'>Italian</option>
					<option value='American'>American</option>
					<option value='Brazilian'>Brazilian</option>
					<option value='Indian'>Indian</option>
					<option value='Mexican'>Mexican</option>
					<option value='Mediterranean'>Mediterranean</option>
					<option value='Pakistani'>Pakistani</option>
					<option value='Turkish'>Turkish</option>
					<option value='Moroccan'>Moroccan</option>
					<option value='Lebanese'>Lebanese</option>
					<option value='Greek'>Greek</option>
					<option value='Japanese'>Japanese</option>
					<option value='Thai'>Thai</option>
				</select>
				<label>
					<input
						type='checkbox'
						checked={isVegetarian}
						onChange={handleVegetarianChange}
					/>
					ベジタリアン 🥦
				</label>
				<select value={sortOption} onChange={handleSortChange}>
					<option value='none'>並び替えなし</option>
					<option value='calories'>Sort by Calories</option>
					<option value='cooktime'>Sort by Cook Time</option>
				</select>{' '}
				<button
					onClick={() => {
						setShowForm(true);
					}}
					className='add-recipe-btn'
				>
					+ NEW
				</button>
			</div>

			{showForm && (
				<div className='modal-overlay'>
					<div className='modal-content'>
						<button
							type='button'
							className='form-modal-close'
							onClick={() => setShowForm((prev) => !prev)}
						>
							❌
						</button>
						<form onSubmit={handleSubmit} className='form-container'>
							<label className='form-field'>
								<span className='form-label'>Name</span>
								<input
									value={formData.name}
									onChange={(event) =>
										setFormData({ ...formData, name: event.target.value })
									}
									required
								/>
							</label>

							<label className='form-field'>
								<span className='form-label'>Image</span>
								<input
									type='file'
									accept='image/*'
									onChange={(event) => {
										const file = event.target.files?.[0];
										if (file) {
											setFormData({ ...formData, image: file });
										}
									}}
									required
								/>
							</label>

							<label className='form-field'>
								<span className='form-label'>Cuisine</span>

								<select
									value={formData.cuisine}
									onChange={(e) =>
										setFormData({ ...formData, cuisine: e.target.value })
									}
									required
								>
									<option value=''>Select Cuisine</option>
									<option value='Asian'>Asian</option>
									<option value='Korean'>Korean</option>
									<option value='Italian'>Italian</option>
									<option value='American'>American</option>
									<option value='Brazilian'>Brazilian</option>
									<option value='Indian'>Indian</option>
									<option value='Mexican'>Mexican</option>
									<option value='Mediterranean'>Mediterranean</option>
									<option value='Pakistani'>Pakistani</option>
									<option value='Turkish'>Turkish</option>
									<option value='Moroccan'>Moroccan</option>
									<option value='Lebanese'>Lebanese</option>
									<option value='Greek'>Greek</option>
									<option value='Japanese'>Japanese</option>
									<option value='Thai'>Thai</option>
								</select>
							</label>

							<label className='form-field'>
								<span className='form-label'>Calories</span>
								<input
									value={formData.caloriesPerServing}
									onChange={(event) =>
										setFormData({
											...formData,
											caloriesPerServing: event.target.value,
										})
									}
								/>
							</label>

							<label className='form-field'>
								<span className='form-label'>Cook Time (min)</span>
								<input
									type='number'
									value={formData.cookTimeMinutes}
									onChange={(event) =>
										setFormData({
											...formData,
											cookTimeMinutes: event.target.value,
										})
									}
								/>
							</label>

							<label className='form-field'>
								<span className='form-label'>Ingredients</span>

								<textarea
									value={formData.ingredients}
									onChange={(event) =>
										setFormData({
											...formData,
											ingredients: event.target.value,
										})
									}
								/>
							</label>

							<label className='form-field'>
								<span className='form-label'> Instructions</span>

								<textarea
									value={formData.instructions}
									onChange={(event) =>
										setFormData({
											...formData,
											instructions: event.target.value,
										})
									}
								/>
							</label>

							<label className='form-field'>
								<span className='form-label'>Tags</span>
								<input
									value={formData.tags}
									onChange={(event) =>
										setFormData({ ...formData, tags: event.target.value })
									}
								/>
							</label>

							<button type='submit' className='form-submit-button'>
								Save
							</button>
						</form>
					</div>
				</div>
			)}

			<ul className='recipe-list'>
				{paginated.map((recipe) => (
					<li key={recipe.id} className='recipe-item'>
						<Link to={`/recipes/${recipe.id}`} className='recipe-link'>
							<img
								src={
									typeof recipe.image === 'string'
										? recipe.image
										: recipe.image
										? URL.createObjectURL(recipe.image)
										: undefined
								}
								alt={recipe.name}
								className='recipe-image'
							/>
						</Link>

						<Link to={`/recipes/${recipe.id}`} className='recipe-link'>
							<h2 className='recipe-title'>{recipe.name}</h2>
						</Link>

						<div className='recipe-details'>
							<p>
								<strong>👩🏻‍🍳 Cuisine:</strong> {recipe.cuisine}
							</p>
							<p>
								<strong>🏋🏻 Calories:</strong> {recipe.caloriesPerServing}
							</p>
							<p>
								<strong>⏰ Cook Time:</strong> {recipe.cookTimeMinutes} min
							</p>

							<div>
								<strong>🥣 Instructions</strong>
								<ol className='recipe-details-instructions'>
									{recipe?.instructions?.map((instruction, index) => (
										<li key={index}>{instruction}</li>
									))}
								</ol>
							</div>
							<p className='recipe-details-ingredients'>
								<strong>🧺 Ingredients: </strong>
								{recipe?.ingredients?.join(', ')}
							</p>
							<p className='recipe-details-tags'>
								{recipe?.tags?.map((tag, index) => (
									<span key={index} className='recipe-details-tag'>
										{tag}
									</span>
								))}
							</p>
						</div>
						<div className='recipe-buttons'>
							<button
								onClick={() => handleEdit(recipe)}
								className='edit-recipe-btn'
							>
								Edit
							</button>
							<button
								onClick={() => handleDelete(recipe.id)}
								className='delete-recipe-btn'
							>
								Delete
							</button>
						</div>
					</li>
				))}
			</ul>
			<div className='pagination'>
				<button
					onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
					disabled={currentPage === 1}
				>
					Prev
				</button>
				{pageNumbers.map((number) => (
					<button
						key={number}
						onClick={() => setCurrentPage(number)}
						className={currentPage === number ? 'active' : ''}
					>
						{number}
					</button>
				))}
				<button
					onClick={() =>
						setCurrentPage((prev) => Math.min(prev + 1, totalPages))
					}
					disabled={currentPage === totalPages}
				>
					Next
				</button>
			</div>
		</>
	);
}

export default ReceipList;
