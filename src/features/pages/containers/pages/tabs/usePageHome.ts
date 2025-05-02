import { useState, useEffect } from "react";
import { Article } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";

const articlesClient = restClient.apiClient.service("apis/articles");

const usePageHome = (listArticle: string[]) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      if (!listArticle || listArticle.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      const fetchedArticles = await Promise.all(
        listArticle.map(async (articleId) => {
          const response = await articlesClient.get(articleId);
          return response.success ? response.data : null;
        })
      );

      const validArticles = fetchedArticles.filter((article): article is Article => article !== null);
      setArticles(validArticles);
    } catch (error) {
      setArticles([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [listArticle]);

  return {
    articles,
    setArticles,
    loading,
  };
};

export default usePageHome;