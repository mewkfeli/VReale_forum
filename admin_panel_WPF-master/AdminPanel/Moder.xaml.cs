using AdminPanel.Model;
using System.Windows.Controls;
using Wpf.Ui.Controls;

namespace AdminPanel
{
    /// <summary>
    /// Логика взаимодействия для Moder.xaml
    /// </summary>
    public partial class Moder : UserControl
    {
        public int id;
        Getter getter = new Getter();
        public Moder()
        {
            InitializeComponent();
        }
        public void setData(
            string Username,
            string Password,
            int Id
            )
        {
            username.Text = "Логин: " + Username;
            password.Text = "Пароль: " + Password;
            id = Id;

        }

        private void Button_Click(object sender, System.Windows.RoutedEventArgs e)
        {
            MessageBox messageBox = new MessageBox();
            var lst = getter.GetModerators();
            var mod = lst.FirstOrDefault(x=> x.Id == id);
            if (mod != null)
            {
                using (var context = new BdContext())
                {
                    context.Remove(mod);
                    context.SaveChanges();
                    messageBox.Content = "Успешное удаление";
                    messageBox.Title = "Уволен";
                    messageBox.ShowDialogAsync();
                }
            }
            else
            {
                messageBox.Content = "Не найден модератор...";
                messageBox.Title = "Ошибка";
                messageBox.ShowDialogAsync();
                return;
            }
            this.Visibility = System.Windows.Visibility.Collapsed;
        }
    }
}
