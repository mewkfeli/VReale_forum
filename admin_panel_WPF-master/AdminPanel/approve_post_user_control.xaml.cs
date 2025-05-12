using AdminPanel.Model;
using System.Windows.Controls;
using Wpf.Ui.Controls;

namespace AdminPanel
{
    /// <summary>
    /// Логика взаимодействия для approve_post_user_control.xaml
    /// </summary>
    public partial class approve_post_user_control : UserControl
    {
        public int id { get; set; }
        public approve_post_user_control()
        {
            InitializeComponent();
        }
        public void set_data(
            string subject,
            string message,
            string name,
            int id
            )
        {
            tboxID.Text = id.ToString();
            tboxMessage.Text = message;
            tboxNameAuthor.Text = name;
            tboxSubejct.Text = subject;
        }

        private void Button_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            MessageBox messageBox = new MessageBox();

            using (var context = new BdContext())
            {
                var post = context.Posts.FirstOrDefault(x=> x.Id == Convert.ToInt32(tboxID.Text));
                if (post is null)
                {
                    messageBox.Content = "Ошибка, пост не найден";
                    messageBox.Title = "Ошибка";
                    messageBox.ShowDialogAsync();
                    return;
                }
                messageBox.Content = "Пост успешно одобрен!";
                messageBox.Title = "Поздравляем!";
                messageBox.ShowDialogAsync();
                post.Status = "accepted";
                context.Update(post);
                context.SaveChanges();
                this.Visibility = System.Windows.Visibility.Collapsed;
            }

        }

        private void Button_Click_1(object sender, System.Windows.RoutedEventArgs e)
        {
            MessageBox messageBox = new MessageBox();

            using (var context = new BdContext())
            {
                var post = context.Posts.FirstOrDefault(x => x.Id == Convert.ToInt32(tboxID.Text));
                if (post is null)
                {
                    messageBox.Content = "Ошибка, пост не найден";
                    messageBox.Title = "Ошибка";
                    messageBox.ShowDialogAsync();
                    return;
                }
                messageBox.Content = "Пост отклонен!";
                messageBox.Title = "Сочувствуем!";
                messageBox.ShowDialogAsync();
                post.Status = "declined";
                context.Update(post);
                context.SaveChanges();
                this.Visibility = System.Windows.Visibility.Collapsed;
            }
        }
    }
}
