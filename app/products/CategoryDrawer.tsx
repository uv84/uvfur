"use client";

import type { Category } from "@/lib/catalog";

type CategoryDrawerProps = {
  categories: Category[];
  expandedCategoryIds: Set<string>;
  selectedCategoryId: string | null;
  onSelect: (category: Category) => void;
  onToggle: (categoryId: string) => void;
  onShowAll: () => void;
};

type CategoryTreeItemProps = Pick<
  CategoryDrawerProps,
  | "categories"
  | "expandedCategoryIds"
  | "onSelect"
  | "onToggle"
  | "selectedCategoryId"
> & {
  category: Category;
  level: number;
};

export function CategoryDrawer({
  categories,
  expandedCategoryIds,
  selectedCategoryId,
  onSelect,
  onToggle,
  onShowAll,
}: CategoryDrawerProps) {
  const rootCategories = categories.filter((category) => !category.parent_id);

  return (
    <section className="catalog-side-group catalog-category-panel">
      <div className="category-panel-heading">
        <h2>Categories</h2>
        <button
          aria-pressed={selectedCategoryId === null}
          className={`category-all-button${selectedCategoryId === null ? " is-selected" : ""}`}
          onClick={onShowAll}
          type="button"
        >
          All
        </button>
      </div>
      <nav aria-label="Product categories" className="category-tree">
        {rootCategories.map((category) => (
          <CategoryTreeItem
            categories={categories}
            category={category}
            expandedCategoryIds={expandedCategoryIds}
            key={category.id}
            level={0}
            onSelect={onSelect}
            onToggle={onToggle}
            selectedCategoryId={selectedCategoryId}
          />
        ))}
      </nav>
    </section>
  );
}

function CategoryTreeItem({
  categories,
  category,
  expandedCategoryIds,
  level,
  onSelect,
  onToggle,
  selectedCategoryId,
}: CategoryTreeItemProps) {
  const children = categories.filter((item) => item.parent_id === category.id);
  const isExpanded = expandedCategoryIds.has(category.id);

  return (
    <>
      <div
        className={`category-tree-row${selectedCategoryId === category.id ? " is-selected" : ""}`}
        style={{ paddingLeft: `${level * 13}px` }}
      >
        <button
          aria-pressed={selectedCategoryId === category.id}
          className="category-tree-select"
          onClick={() => onSelect(category)}
          type="button"
        >
          {category.name}
        </button>
        {children.length > 0 && (
          <button
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.name}`}
            className="category-tree-toggle"
            onClick={() => onToggle(category.id)}
            type="button"
          >
            <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
          </button>
        )}
      </div>
      {isExpanded &&
        children.map((child) => (
          <CategoryTreeItem
            categories={categories}
            category={child}
            expandedCategoryIds={expandedCategoryIds}
            key={child.id}
            level={level + 1}
            onSelect={onSelect}
            onToggle={onToggle}
            selectedCategoryId={selectedCategoryId}
          />
        ))}
    </>
  );
}
