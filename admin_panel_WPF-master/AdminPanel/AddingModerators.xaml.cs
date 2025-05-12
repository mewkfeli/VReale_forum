using AdminPanel.Model;
using System;
using System.Collections.Generic;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
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
using TextBlock = Wpf.Ui.Controls.TextBlock;

namespace AdminPanel
{
    /// <summary>
    /// Логика взаимодействия для AddingModerators.xaml
    /// </summary>
    public partial class AddingModerators : FluentWindow
    {
        Getter getter = new Getter();
        public AddingModerators()
        {
            InitializeComponent();
            update_data();
        }
        void update_data()
        {
            stackPanel.Children.Clear();
            foreach (var item in getter.GetModerators())
            {
                if (item.Role == "admin")
                {
                    continue;
                }
                Moder moder = new Moder();
                moder.setData(item.Username, item.Password, item.Id);
                TextBlock text = new TextBlock();
                stackPanel.Children.Add(text);
                stackPanel.Children.Add(moder);
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

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            if (getter.GetModerators().Exists(x=> x.Username == tboxLogin.Text))
            {
                MessageBox messageBox = new MessageBox();
                messageBox.Content = "Модератор с таким логином уже существует!";
                messageBox.ShowDialogAsync();   
                return;
            }
            Moderator moderator = new Moderator();
            moderator.Password = tboxPassword.Text.ToString();
            moderator.Role = "moderator";
            moderator.Username = tboxLogin.Text;
            moderator.Id = getter.GetModerators().Max(x => x.Id) + 1;
            getter.db.Add(moderator);
            getter.db.SaveChanges();
            update_data();
        }
    }
}
