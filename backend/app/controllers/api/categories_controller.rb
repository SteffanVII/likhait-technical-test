class Api::CategoriesController < ApplicationController
  def index
    categories = Category.order(:name)
    render json: categories
  end

  def create
    category = Category.new(category_params)

    if category.save
      render json: format_category(category), status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    category = Category.find(params[:id])

    if category.update(category_params)
      render json: format_category(category), status: :ok
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    category = Category.find(params[:id])
    replacement_id = params[:replacement_id]

    ActiveRecord::Base.transaction do
      Expense.where(category_id: category.id).update_all(category_id: replacement_id)
      category.destroy!
    end

    render json: { message: "Category deleted successfully" }, status: :ok

  rescue ActiveRecord::RecordNotDestroyed
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
  rescue StandardError => e
      render json: { errors: [ e.message ] }, status: :internal_server_error
  end

  private

  def category_params
    params.require(:category).permit(:name, :emoji)
  end

  def format_category(category)
    {
      id: category.id,
      name: category.name,
      created_at: category.created_at,
      updated_at: category.updated_at
    }
  end
end
