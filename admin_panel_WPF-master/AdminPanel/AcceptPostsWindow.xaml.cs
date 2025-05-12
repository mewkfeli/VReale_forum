using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;
using Wpf.Ui.Controls;
using MessageBox = Wpf.Ui.Controls.MessageBox;

namespace AdminPanel
{
    /// <summary>
    /// Логика взаимодействия для AcceptPostsWindow.xaml
    /// </summary>
    public partial class AcceptPostsWindow : FluentWindow
    {
        public bool isAdmin { get; set; } = false;
        public AcceptPostsWindow()
        {
            InitializeComponent();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (isAdmin)
            {
                AddingModerators addingModerators = new AddingModerators();
                addingModerators.ShowDialog();return;
            }

            Wpf.Ui.Controls.MessageBox messageBox = new MessageBox();
            messageBox.Title = "Ошибка!";
            messageBox.Content = "Недостаточно прав!";
            messageBox.ShowDialogAsync();

        }

        private void TitleBar_CloseClicked(TitleBar sender, RoutedEventArgs args)
        {
            new MainWindow().Show();
            Close();
        }

        private void Button_Click_1(object sender, RoutedEventArgs e)
        {
            CheckPosts checkPosts = new CheckPosts();
            checkPosts.ShowDialog();
        }
    }
}
