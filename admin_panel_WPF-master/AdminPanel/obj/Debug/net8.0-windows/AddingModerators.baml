   M S B A M L   `   `   `  ����E  AAdminPanel, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null'clr-namespace:AdminPanel
AdminPanel  5   	   !    AdminPanel.AddingModerators   5      W SPresentationCore, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35\ XPresentationFramework, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35e aSystem.Windows.Controls.Ribbon, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089R NWindowsBase, Version=8.0.0.0, Culture=neutral, PublicKeyToken=31bf3856ad364e35F 9http://schemas.microsoft.com/winfx/2006/xaml/presentation     5   	   R NSystem.Xaml, Version=8.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089:x,http://schemas.microsoft.com/winfx/2006/xaml     5   	   @d2http://schemas.microsoft.com/expression/blend/2008     5   	   Jmc;http://schemas.openxmlformats.org/markup-compatibility/2006     5   	   *localclr-namespace:AdminPanel     5   	   M IWpf.Ui, Version=4.0.0.0, Culture=neutral, PublicKeyToken=11f9f5cc97b3ffd6/ui&http://schemas.lepo.co/wpfui/2022/xaml  5
   	     � WindowStartupLocation$  CenterScreen=�5       � Title$ AddingModerators��5   	   $	��450��6"   $	��700��6/   .��5      �  � RowDefinitions 5   
   �� 5      $��50 �6   �� 5      $��15 �6   �� 5      �� 5      �� 5      �� 5       � ColumnDefinitions 5   
   �� 5      �� 5      $	��200 �6   .+�5   
     Wpf.Ui.Controls.TitleBar     Title$@ :Панель управления модераторами��6   $��Arial)�6>   $��2��6R     Wpf.Ui.Controls.TextBlock  5   
   $��1��5      $��Center=�5      $��Center=�5      $��20(�5       �� TextAlignment$ Center=�5       $��Arial)�5!      $��2��5"      $
��Wrap=�5#      $<��6Добавление нового модератора��5$        Wpf.Ui.Controls.TextBox  5%   
   -   5          Name$ 	tboxLogin��5.      $��1��5&      $��3��5'         PlaceholderText$ 
Логин��5(         PlaceholderEnabled$
 True��5*      $	��160��5+      $��50��5,      $��24(�5-      $��Arial)�5/        51   
   -   5        $ tboxPassword��54      $��1��52      $��4��53      $ Пароль��55      $
 True��57      $	��160��58      $��50��59      $��24(�5:      $��Arial)�5;        Wpf.Ui.Controls.Button  5=   
   -   5        $��Добавить��5>      $��5��5@      $��1��6   $	��150��5A      $��50��5B      $��Center=�5C      $��Center=�5D      $��24(�5E      $��Arial)�5F      6    �� 5J   
   $��0��6   $��2��6(   $��4��65   .��5K      �� -   5        	 ��Name$	 
stackPanel��5K      5M      5N      5P      5Q      