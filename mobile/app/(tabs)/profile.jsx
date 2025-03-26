import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import Toast from "react-native-simple-toast";
import { useAuthStore } from "../../store/authStore";
import styles from "../../assets/styles/profile.styles";
import ProfileHeader from "../../components/ProfileHeader";
import LogoutButton from "../../components/LogoutButton";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { Image } from "expo-image";
import Loader from "../../components/Loader";

export default function Profile() {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isloading, setIsLoading] = useState(true);
  const [deleteLoader, setDeleteLoader] = useState(null);
  const { token } = useAuthStore();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}books/recommend`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong");
      setBooks(data.books);
    } catch (error) {
      Toast.show(
        "Failed to load the profile data. Pull down to refresh.",
        Toast.SHORT
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const confirmDelete = (bookId) => {
    Alert.alert(
      "Delete Recommendation",
      "Are you sure you want to delete this recommendation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => deleteBook(bookId),
          style: "destructive",
        },
      ]
    );
  };
  const deleteBook = async (id) => {
    try {
      setDeleteLoader(id);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}books/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete recommendation");
      setBooks(books.filter((book) => book._id !== id));
      Toast.show("Book deleted successfully", Toast.SHORT);
    } catch (error) {
      Toast.show(
        error.message || "Failed to delete recommendation",
        Toast.SHORT
      );
    } finally {
      setDeleteLoader(null);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };
  const renderRatingPicker = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={14}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };
  const renderItem = ({ item }) => (
    <View style={styles.bookItem}>
      <Image source={item.image} style={styles.bookImage} />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingPicker(item.rating)}
        </View>
        <Text style={styles.bookCaption}>{item.caption}</Text>
        <Text style={styles.bookDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
      >
        {deleteLoader === item._id ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    </View>
  );

  if (isloading && !refreshing) return <Loader size="large" />;

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      <View style={styles.booksHeader}>
        <Text style={styles.booksTitle}>Your Recommendation 📚</Text>
        <Text style={styles.booksCount}>{books.length} books</Text>
      </View>

      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.booksList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="book-outline"
              size={60}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>Add your first book</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
