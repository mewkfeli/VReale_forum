using AdminPanel.Model;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Wpf.Ui.Controls;
using MessageBox = Wpf.Ui.Controls.MessageBox;

namespace AdminPanel
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : FluentWindow
    {
        Getter Getter;
        public MainWindow()
        {

            InitializeComponent();
            Getter = new Getter();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            MessageBox messageBox = new MessageBox();

            if (tboxPassword.Text.ToString().Length == 0 || tboxId.Text.ToString().Length == 0) 
            {
                messageBox.Title = "Ошибка!";

                messageBox.Content = "Пустой логин или пароль";

                messageBox.ShowDialogAsync();

                return;
            }
            
            var listModers = Getter.GetModerators();

            if (listModers.Exists(x=> x.Username.ToString() == tboxId.Text && x.Password == tboxPassword.Password))
            {

                var user = listModers.FirstOrDefault(x=> x.Username == tboxId.Text && x.Password == tboxPassword.Password);
                if (user is null)
                {
                    return;
                }
                //TODO open
                AcceptPostsWindow acceptPostsWindow = new AcceptPostsWindow();
                if (user.Role == "admin")
                {
                    acceptPostsWindow.isAdmin = true;
                }
                acceptPostsWindow.Show();
                Close();
            }
            else
            {
                messageBox.Title = "Ошибка!";

                messageBox.Content = "Неверный логин или пароль";

                messageBox.ShowDialogAsync();
                return; 
            }

        }

        private void tboxId_PreviewTextInput(object sender, TextCompositionEventArgs e)
        {
            if (!Regex.IsMatch(e.Text, @"\p{IsBasicLatin}"))
            {
                e.Handled = true;
                return;
            }
        }
    }
}